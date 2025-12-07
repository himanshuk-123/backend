import { CategoryService } from '../service/category.service.js';

const categoryService = new CategoryService();

/**
 * Get all categories (public endpoint)
 * @route GET /api/categories
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getAllCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  } catch (error) {
    console.error('Error in getAllCategories controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to fetch categories'
    });
  }
};

/**
 * Get shops by category (public endpoint)
 * @route GET /api/categories/:category/shops
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getShopsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    const result = await categoryService.getShopsByCategory(category, { page, limit, search });

    res.status(200).json({
      success: true,
      message: 'Shops retrieved successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in getShopsByCategory controller:', error);

    if (error.message === 'Category is required') {
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

