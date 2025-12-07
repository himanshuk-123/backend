import { CategoryRepository } from '../repositories/category.repositories.js';

export class CategoryService {
  constructor() {
    this.categoryRepository = new CategoryRepository();
  }

  /**
   * Get all categories
   * @returns {Array} List of categories
   */
  async getAllCategories() {
    try {
      return await this.categoryRepository.findAll();
    } catch (error) {
      console.error('Error in getAllCategories service:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  /**
   * Get shops by category
   * @param {string} category - Category name
   * @param {Object} options - Query options
   * @returns {Object} Shops with pagination
   */
  async getShopsByCategory(category, options = {}) {
    try {
      if (!category) {
        throw new Error('Category is required');
      }

      return await this.categoryRepository.getShopsByCategory(category, options);
    } catch (error) {
      if (error.message === 'Category is required') {
        throw error;
      }
      console.error('Error in getShopsByCategory service:', error);
      throw new Error('Failed to fetch shops by category');
    }
  }
}

