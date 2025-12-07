import { ProductRepository } from '../repositories/product.repositories.js';
import { ShopRepository } from '../repositories/shop.repositories.js';
import { ValidationError } from './user.service.js';

export class ProductService {
  constructor() {
    this.productRepository = new ProductRepository();
    this.shopRepository = new ShopRepository();
  }

  /**
   * Validate product data
   * @param {Object} productData - Product data
   * @throws {ValidationError} When validation fails
   */
  validateProductData(productData) {
    const { name, Base_Price } = productData;

    if (!name || name.trim().length < 2) {
      throw new ValidationError('Product name must be at least 2 characters long');
    }

    if (Base_Price === undefined || Base_Price === null || Base_Price < 0) {
      throw new ValidationError('Valid price (>= 0) is required');
    }
  }

  /**
   * Get all products with pagination (public - can filter by shop)
   * @param {Object} options - Query options
   * @returns {Object} Products with pagination
   */
  async getAllProducts(options = {}) {
    try {
      return await this.productRepository.findAll(options);
    } catch (error) {
      console.error('Error in getAllProducts service:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get products by shop ID (public)
   * @param {number} shopId - Shop ID
   * @param {Object} options - Query options
   * @returns {Object} Products with pagination
   */
  async getProductsByShop(shopId, options = {}) {
    try {
      if (!shopId || isNaN(shopId)) {
        throw new ValidationError('Invalid shop ID');
      }

      return await this.productRepository.findByShopId(parseInt(shopId), options);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in getProductsByShop service:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Get product by ID (public - can include shop-specific info)
   * @param {number} productId - Product ID
   * @param {number|null} shopId - Optional shop ID for shop-specific info
   * @returns {Object} Product data
   * @throws {Error} If product not found
   */
  async getProductById(productId, shopId = null) {
    try {
      if (!productId || isNaN(productId)) {
        throw new ValidationError('Invalid product ID');
      }

      const product = await this.productRepository.findById(parseInt(productId), shopId);
      
      if (!product) {
        throw new ValidationError('Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in getProductById service:', error);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Create product and add to shop inventory (shopkeeper only)
   * @param {Object} productData - Product data
   * @param {number} shopId - Shop ID
   * @param {number} ownerId - Owner (user) ID (for authorization)
   * @returns {Object} Created product with inventory
   */
async createProduct(productData, shopId, ownerId) {
  const {
    name,
    description,
    Base_Price,
    stock_quantity = 0,
    selling_price,
    unit
  } = productData;

  // VALIDATE
  if (!name || name.trim().length < 2)
    throw new ValidationError("Product name requires at least 2 characters");

  if (Base_Price === undefined || Base_Price === null || isNaN(Number(Base_Price)))
    throw new ValidationError("Base_Price must be a valid number");

  const finalBasePrice = Number(Base_Price);

  // VERIFY SHOP OWNER
  const isOwner = await this.shopRepository.isOwner(shopId, ownerId);
  if (!isOwner) throw new ValidationError("You cannot add products to this shop");

  // CREATE PRODUCT
  const product = await this.productRepository.create({
    name: name.trim(),
    description: description?.trim() || null,
    Base_Price: finalBasePrice,
    image_url: null,
  });

  // INVENTORY PRICE
  const inventoryPrice = selling_price !== undefined
    ? Number(selling_price)
    : finalBasePrice;

  // ADD TO INVENTORY
  const inventory = await this.productRepository.addToInventory(
    shopId,
    product.product_id,
    {
      stock_quantity: Number(stock_quantity),
      selling_price: inventoryPrice,
      unit
    }
  );

  return { ...product, inventory };
}


  /**
   * Get shopkeeper's products (shopkeeper only)
   * @param {number} ownerId - Owner (user) ID
   * @param {number|null} shopId - Optional shop ID filter
   * @param {Object} options - Query options
   * @returns {Object} Products with pagination
   */
  async getMyProducts(ownerId, shopId = null, options = {}) {
    try {
      if (shopId) {
        // Verify shop ownership if shopId is provided
        const isOwner = await this.shopRepository.isOwner(shopId, ownerId);
        if (!isOwner) {
          throw new ValidationError('You do not have permission to view products from this shop');
        }
      }

      return await this.productRepository.findByOwner(ownerId, shopId, options);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in getMyProducts service:', error);
      throw new Error('Failed to fetch products');
    }
  }

  /**
   * Update product (shopkeeper only - must own the shop)
   * @param {number} productId - Product ID
   * @param {Object} productData - Updated product data
   * @param {number} ownerId - Owner (user) ID (for authorization)
   * @returns {Object} Updated product
   */
  async updateProduct(productId, ownerId, productData) {
    try {
      if (!productId || isNaN(productId)) {
        throw new ValidationError('Invalid product ID');
      }

      // Check if product belongs to owner's shop
      const isOwner = await this.productRepository.isProductOwner(parseInt(productId), ownerId);
      if (!isOwner) {
        throw new ValidationError('You do not have permission to update this product. You can only update products in your own shops.');
      }

      // Validate if updating name or price
      if (productData.name || productData.price !== undefined) {
        const existingProduct = await this.productRepository.findById(parseInt(productId));
        const updatedData = { ...existingProduct, ...productData };
        this.validateProductData(updatedData);
      }

      const updatedProduct = await this.productRepository.update(parseInt(productId), productData);
      if (!updatedProduct) {
        throw new ValidationError('Product not found');
      }

      return updatedProduct;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in updateProduct service:', error);
      throw new Error('Failed to update product');
    }
  }

  /**
   * Update inventory entry (shopkeeper only - must own the shop)
   * @param {number} inventoryId - Inventory ID
   * @param {Object} inventoryData - Updated inventory data
   * @param {number} ownerId - Owner (user) ID (for authorization)
   * @returns {Object} Updated inventory entry
   */
  async updateInventory(inventoryId, ownerId, inventoryData) {
    try {
      if (!inventoryId || isNaN(inventoryId)) {
        throw new ValidationError('Invalid inventory ID');
      }

      // Check if inventory entry belongs to owner's shop
      const isOwner = await this.productRepository.isInventoryOwner(parseInt(inventoryId), ownerId);
      if (!isOwner) {
        throw new ValidationError('You do not have permission to update this inventory. You can only update inventory for your own shops.');
      }

      const updatedInventory = await this.productRepository.updateInventory(parseInt(inventoryId), inventoryData);
      if (!updatedInventory) {
        throw new ValidationError('Inventory entry not found');
      }

      return updatedInventory;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in updateInventory service:', error);
      throw new Error('Failed to update inventory');
    }
  }

  /**
   * Delete product (shopkeeper only - soft delete)
   * @param {number} productId - Product ID
   * @param {number} ownerId - Owner (user) ID (for authorization)
   * @returns {boolean} True if deleted
   */
  async deleteProduct(productId, ownerId) {
    try {
      if (!productId || isNaN(productId)) {
        throw new ValidationError('Invalid product ID');
      }

      // Check if product belongs to owner's shop
      const isOwner = await this.productRepository.isProductOwner(parseInt(productId), ownerId);
      if (!isOwner) {
        throw new ValidationError('You do not have permission to delete this product. You can only delete products from your own shops.');
      }

      const deleted = await this.productRepository.softDelete(parseInt(productId));
      if (!deleted) {
        throw new ValidationError('Product not found');
      }

      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in deleteProduct service:', error);
      throw new Error('Failed to delete product');
    }
  }
}
