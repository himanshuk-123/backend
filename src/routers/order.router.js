import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  placeOrder,
  getUserOrders,
  getOrderDetails
} from "../controllers/order.controller.js";

const router = express.Router();

/**
 * All routes are protected
 */

router.post("/", authenticate, placeOrder);

router.get("/", authenticate, getUserOrders);

router.get("/:orderId", authenticate, getOrderDetails);

export default router;
