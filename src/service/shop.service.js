import { ShopRepository } from '../repositories/shop.repositories.js';
import { ValidationError } from './user.service.js';

export class ShopService {
  constructor() {
    this.shopRepository = new ShopRepository();
  }

  /**
   * Validate shop data
   * @param {Object} shopData - Shop data to validate
   * @throws {ValidationError} When validation fails
   */
  validateShopData(shopData) {
    const { name, cat_id, address, pincode } = shopData;

    if (!name || name.trim().length < 2) {
      throw new ValidationError('Shop name must be at least 2 characters long');
    }

    if (!cat_id) {
      throw new ValidationError('Category is required');
    }

    if (!address || address.trim().length < 5) {
      throw new ValidationError('Address is required and must be at least 5 characters long');
    }

    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      throw new ValidationError('Valid 6-digit pincode is required');
    }
  }

  /**
   * Create a new shop
   * @param {Object} shopData - Shop data
   * @param {number} ownerId - Owner (user) ID
   * @returns {Object} Created shop
   */
  async createShop(shopData, ownerId) {
    try {
      this.validateShopData(shopData);

      const newShopData = {
        owner_id: ownerId,
        name: shopData.name.trim(),
        description: shopData.description ? shopData.description.trim() : null,
        cat_id: shopData.cat_id,
        address: shopData.address.trim(),
        pincode: shopData.pincode.trim(),
        latitude: shopData.latitude || null,
        longitude: shopData.longitude || null
      };

      return await this.shopRepository.create(newShopData);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in createShop service:', error);
      throw new Error('Failed to create shop');
    }
  }

  /**
   * Get shop by ID
   * @param {number} shopId - Shop ID
   * @returns {Object} Shop data
   */
  async getShopById(shopId) {
    try {
      if (!shopId || isNaN(shopId)) {
        throw new ValidationError('Invalid shop ID');
      }

      const shop = await this.shopRepository.findById(parseInt(shopId));
      if (!shop) {
        throw new ValidationError('Shop not found');
      }

      return shop;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in getShopById service:', error);
      throw new Error('Failed to fetch shop');
    }
  }

  /**
   * Get shops by owner (for shopkeepers to see their shops)
   * @param {number} ownerId - Owner (user) ID
   * @returns {Array} List of shops
   */
  async getShopsByOwner(ownerId) {
    try {
      return await this.shopRepository.findByOwnerId(ownerId);
    } catch (error) {
      console.error('Error in getShopsByOwner service:', error);
      throw new Error('Failed to fetch shops');
    }
  }

  /**
   * Get shops by category (for customers)
   * @param {string} category - Category name
   * @param {Object} options - Query options
   * @returns {Object} Shops with pagination
   */
  async getShopsByCategory(category, options = {}) {
    try {
      if (!category) {
        throw new ValidationError('Category is required');
      }

      return await this.shopRepository.findByCategory(category, options);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in getShopsByCategory service:', error);
      throw new Error('Failed to fetch shops');
    }
  }

  /**
   * Update shop (only by owner)
   * @param {number} shopId - Shop ID
   * @param {Object} shopData - Updated shop data
   * @param {number} ownerId - Owner (user) ID (for authorization)
   * @returns {Object} Updated shop
   */
  async updateShop(shopId, shopData, ownerId) {
    try {
      if (!shopId || isNaN(shopId)) {
        throw new ValidationError('Invalid shop ID');
      }

      // Check ownership
      const isOwner = await this.shopRepository.isOwner(parseInt(shopId), ownerId);
      if (!isOwner) {
        throw new ValidationError('You do not have permission to update this shop');
      }

      // Validate if name/category/address/pincode are being updated
      if (shopData.name || shopData.category || shopData.address || shopData.pincode) {
        const existingShop = await this.shopRepository.findById(parseInt(shopId));
        const updatedData = { ...existingShop, ...shopData };
        this.validateShopData(updatedData);
      }

      const updatedShop = await this.shopRepository.update(parseInt(shopId), shopData);
      if (!updatedShop) {
        throw new ValidationError('Shop not found');
      }

      return updatedShop;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in updateShop service:', error);
      throw new Error('Failed to update shop');
    }
  }

  /**
   * Delete shop (only by owner)
   * @param {number} shopId - Shop ID
   * @param {number} ownerId - Owner (user) ID (for authorization)
   * @returns {boolean} True if deleted
   */
  async deleteShop(shopId, ownerId) {
    try {
      if (!shopId || isNaN(shopId)) {
        throw new ValidationError('Invalid shop ID');
      }

      // Check ownership
      const isOwner = await this.shopRepository.isOwner(parseInt(shopId), ownerId);
      if (!isOwner) {
        throw new ValidationError('You do not have permission to delete this shop');
      }

      const deleted = await this.shopRepository.softDelete(parseInt(shopId));
      if (!deleted) {
        throw new ValidationError('Shop not found');
      }

      return true;
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      console.error('Error in deleteShop service:', error);
      throw new Error('Failed to delete shop');
    }
  }
}

