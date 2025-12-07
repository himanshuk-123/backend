import { ProductService } from '../service/product.service.js';
import { ValidationError } from '../service/user.service.js';

const productService = new ProductService();

/**
 * Get all products (public endpoint - can filter by shop)
 * @route GET /api/products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const shop_id = req.query.shop_id || null;

    const result = await productService.getAllProducts({ 
      page, 
      limit, 
      search,
      shop_id: shop_id ? parseInt(shop_id) : null
    });

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in getAllProducts controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch products'
    });
  }
};

/**
 * Get products by shop ID (public endpoint)
 * @route GET /api/shops/:id/products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProductsByShop = async (req, res) => {
  try {
    const { id: shopId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const result = await productService.getProductsByShop(shopId, { page, limit, search });

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in getProductsByShop controller:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch products'
    });
  }
};

/**
 * Get product by ID (public endpoint)
 * @route GET /api/products/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const shop_id = req.query.shop_id || null;

    const product = await productService.getProductById(id, shop_id ? parseInt(shop_id) : null);

    res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      data: product
    });
  } catch (error) {
    console.error('Error in getProductById controller:', error);

    if (error instanceof ValidationError) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch product'
    });
  }
};

/**
 * Create product (shopkeeper only)
 * @route POST /api/products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createProduct = async (req, res) => {
  try {
    const { shop_id } = req.body;

    if (!shop_id) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: 'Shop ID is required'
      });
    }

    const result = await productService.createProduct(req.body, shop_id, req.user.user_id);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in createProduct controller:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to create product'
    });
  }
};

/**
 * Get my products (shopkeeper only)
 * @route GET /api/products/my-products
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMyProducts = async (req, res) => {
  try {
    const shop_id = req.query.shop_id || null;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const result = await productService.getMyProducts(
      req.user.user_id,
      shop_id ? parseInt(shop_id) : null,
      { page, limit, search }
    );

    res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in getMyProducts controller:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch products'
    });
  }
};

/**
 * Update product (shopkeeper only)
 * @route PUT /api/products/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.updateProduct(id, req.user.user_id, req.body);

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error in updateProduct controller:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to update product'
    });
  }
};

/**
 * Update inventory (shopkeeper only)
 * @route PUT /api/products/inventory/:inventoryId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    const inventory = await productService.updateInventory(inventoryId, req.user.user_id, req.body);

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory
    });
  } catch (error) {
    console.error('Error in updateInventory controller:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to update inventory'
    });
  }
};

/**
 * Delete product (shopkeeper only)
 * @route DELETE /api/products/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(id, req.user.user_id);

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteProduct controller:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to delete product'
    });
  }
};
