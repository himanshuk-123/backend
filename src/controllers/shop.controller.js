import { ShopService } from '../service/shop.service.js';
import { ValidationError } from '../service/user.service.js';

const shopService = new ShopService();

/**
 * Create a new shop (shopkeeper only)
 * @route POST /api/shops
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const createShop = async (req, res) => {
  try {
    const shop = await shopService.createShop(req.body, req.user.user_id);

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      data: shop
    });
  } catch (error) {
    console.error('Error in createShop controller:', error);

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
      error: 'Failed to create shop'
    });
  }
};

/**
 * Get shop by ID (public endpoint)
 * @route GET /api/shops/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getShopById = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await shopService.getShopById(id);

    res.status(200).json({
      success: true,
      message: 'Shop retrieved successfully',
      data: shop
    });
  } catch (error) {
    console.error('Error in getShopById controller:', error);

    if (error instanceof ValidationError) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch shop'
    });
  }
};

/**
 * Get shops by category (public endpoint)
 * @route GET /api/shops
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getShopsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category query parameter is required'
      });
    }

    const result = await shopService.getShopsByCategory(category, { page, limit, search });

    res.status(200).json({
      success: true,
      message: 'Shops retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in getShopsByCategory controller:', error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch shops'
    });
  }
};

/**
 * Get my shops (shopkeeper's own shops)
 * @route GET /api/shops/my-shops
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getMyShops = async (req, res) => {
  try {
    const shops = await shopService.getShopsByOwner(req.user.user_id);

    res.status(200).json({
      success: true,
      message: 'Shops retrieved successfully',
      data: shops
    });
  } catch (error) {
    console.error('Error in getMyShops controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch shops'
    });
  }
};

/**
 * Update shop (shopkeeper only - own shops)
 * @route PUT /api/shops/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const updateShop = async (req, res) => {
  try {
    const { id } = req.params;
    const shop = await shopService.updateShop(id, req.body, req.user.user_id);

    res.status(200).json({
      success: true,
      message: 'Shop updated successfully',
      data: shop
    });
  } catch (error) {
    console.error('Error in updateShop controller:', error);

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
      error: 'Failed to update shop'
    });
  }
};

/**
 * Delete shop (shopkeeper only - own shops)
 * @route DELETE /api/shops/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const deleteShop = async (req, res) => {
  try {
    const { id } = req.params;
    await shopService.deleteShop(id, req.user.user_id);

    res.status(200).json({
      success: true,
      message: 'Shop deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteShop controller:', error);

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
      error: 'Failed to delete shop'
    });
  }
};

