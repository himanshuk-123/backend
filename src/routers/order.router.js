import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  placeOrder,
  getUserOrders,
  getOrderDetails,
  cancelOrderByUser
} from "../controllers/order.controller.js";

const router = express.Router();

/**
 * All routes are protected
 */

router.post("/", authenticate, placeOrder);

router.get("/", authenticate, getUserOrders);

router.get("/:orderId", authenticate, getOrderDetails);

router.put("/:orderId/cancel", authenticate, cancelOrderByUser);

export default router;
