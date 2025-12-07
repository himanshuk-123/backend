import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  getUserAddresses,
  getDefaultAddress,
  createAddress,
  setDefault,
  deleteAddress,
} from "../controllers/userAddress.controller.js";

const router = express.Router();

/**
 * All routes are PROTECTED
 */

router.get("/", authenticate, getUserAddresses);

router.get("/default", authenticate, getDefaultAddress);

router.post("/", authenticate, createAddress);

router.put("/:id/set-default", authenticate, setDefault);

router.delete("/:id", authenticate, deleteAddress);

export default router;
