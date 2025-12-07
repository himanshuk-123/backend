import express from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const  router = express.Router();

/**
 * Cart routes
 * All routes require authentication - only logged-in users can use cart
 */

/**
 * @route   GET /api/cart
 * @desc    Get cart with items
 * @access  Private (authenticated users only)
 */
router.get('/', authenticate, getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Add item to cart
 * @access  Private (authenticated users only)
 */
router.post('/items', authenticate, addToCart);

/**
 * @route   PUT /api/cart/items/:itemId
 * @desc    Update cart item quantity
 * @access  Private (authenticated users only)
 */
router.put('/items/:itemId', authenticate, updateCartItem);

/**
 * @route   DELETE /api/cart/items/:itemId
 * @desc    Remove item from cart
 * @access  Private (authenticated users only)
 */
router.delete('/items/:itemId', authenticate, removeCartItem);

/**
 * @route   DELETE /api/cart
 * @desc    Clear cart
 * @access  Private (authenticated users only)
 */
router.delete('/', authenticate, clearCart);

export default router;


