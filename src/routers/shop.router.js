import express from 'express';
import { createShop, getShopById, getShopsByCategory, getMyShops, updateShop, deleteShop } from '../controllers/shop.controller.js';
import { getProductsByShop } from '../controllers/product.controller.js';
import { uploadShopImage } from '../controllers/image.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/auth.middleware.js';
import { upload, handleUploadError } from '../middleware/upload.middleware.js';
import { getShopDashboard } from '../controllers/shopDashboard.controller.js';
const router = express.Router();

/**
 * @route   GET /api/shops
 * @desc    Get shops by category (public)
 * @access  Public
 * @query   category (required), page, limit, search
 */
router.get('/', getShopsByCategory);

/**
 * @route   GET /api/shops/my-shops
 * @desc    Get shopkeeper's own shops
 * @access  Private (shopkeeper only)
 */
router.get('/my-shops', authenticate, authorize('shopkeeper'), getMyShops);

/**
 * @route   GET /api/shops/:id/products
 * @desc    Get products by shop ID (public)
 * @access  Public
 */
router.get('/:id/products', getProductsByShop);

/**
 * @route   GET /api/shops/:id
 * @desc    Get shop by ID (public)
 * @access  Public
 */
router.get('/:id', getShopById);

/**
 * @route   POST /api/shops
 * @desc    Create a new shop (shopkeeper only)
 * @access  Private (shopkeeper only)
 */
router.post('/', authenticate, authorize('shopkeeper'), createShop);

/**
 * @route   POST /api/shops/:id/upload-image
 * @desc    Upload shop image (shopkeeper only - own shops)
 * @access  Private (shopkeeper only)
 */
router.post('/:id/upload-image', authenticate, authorize('shopkeeper'), upload.single('image'), handleUploadError, uploadShopImage);

/**
 * @route   PUT /api/shops/:id
 * @desc    Update shop (shopkeeper only - own shops)
 * @access  Private (shopkeeper only)
 */
router.put('/:id', authenticate, authorize('shopkeeper'), updateShop);

/**
 * @route   DELETE /api/shops/:id
 * @desc    Delete shop (shopkeeper only - own shops)
 * @access  Private (shopkeeper only)
 */
router.delete('/:id', authenticate, authorize('shopkeeper'), deleteShop);

/**
 * @route   GET /api/shop/dashboard/:shopId
 * @desc    Get complete dashboard data for a shop
 * @access  Private
 */
router.get('/dashboard/:shopId', authenticate, authorize('shopkeeper'), getShopDashboard);
export default router;


