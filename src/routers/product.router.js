import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  getMyProducts,
  updateProduct,
  updateInventory,
  deleteProduct
} from '../controllers/product.controller.js';
import { uploadProductImage } from '../controllers/image.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/auth.middleware.js';
import { upload, handleUploadError } from '../middleware/upload.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products (public - can filter by shop_id)
 * @access  Public
 */
router.get('/', getAllProducts);

/**
 * @route   GET /api/products/my-products
 * @desc    Get shopkeeper's own products (shopkeeper only)
 * @access  Private (shopkeeper only)
 */
router.get('/my-products', authenticate, authorize('shopkeeper'), getMyProducts);

/**
 * @route   POST /api/products
 * @desc    Create product (shopkeeper only)
 * @access  Private (shopkeeper only)
 */
router.post('/', authenticate, authorize('shopkeeper'), createProduct);

/**
 * @route   PUT /api/products/inventory/:inventoryId
 * @desc    Update inventory entry (shopkeeper only)
 * @access  Private (shopkeeper only)
 */
router.put('/inventory/:inventoryId', authenticate, authorize('shopkeeper'), updateInventory);

/**
 * @route   POST /api/products/:id/upload-image
 * @desc    Upload product image (shopkeeper only)
 * @access  Private (shopkeeper only)
 */
router.post('/:id/upload-image', authenticate, authorize('shopkeeper'), upload.single('image'), handleUploadError, uploadProductImage);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (shopkeeper only)
 * @access  Private (shopkeeper only)
 */
router.put('/:id', authenticate, authorize('shopkeeper'), updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (shopkeeper only)
 * @access  Private (shopkeeper only)
 */
router.delete('/:id', authenticate, authorize('shopkeeper'), deleteProduct);

/**
 * @route   GET /api/products/:id
 * @desc    Get product by ID (public)
 * @access  Public
 */
router.get('/:id', getProductById);

export default router;




