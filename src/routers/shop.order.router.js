import express from "express";
import { authenticate, authorize } from "../middleware/auth.middleware.js";
import {
  getShopOrders,
  getShopOrderDetails,
  updateOrderStatus
} from "../controllers/shop.order.controller.js";

const router = express.Router();

// Only SHOPKEEPERS allowed
router.use(authenticate, authorize("shopkeeper"));

// Get all orders for shop
router.get("/:shopId", getShopOrders);

// Get single order details
router.get("/:shopId/:orderId", getShopOrderDetails);

// Update order status
router.put("/:shopId/:orderId/status", updateOrderStatus);

export default router;
