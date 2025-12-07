import express from 'express';
import { getAllCategories, getShopsByCategory } from '../controllers/category.controller.js';

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories (public)
 * @access  Public
 */
router.get('/', getAllCategories);

/**
 * @route   GET /api/categories/:category/shops
 * @desc    Get shops by category (public)
 * @access  Public
 */
router.get('/:category/shops', getShopsByCategory);

export default router;

