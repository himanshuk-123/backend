// shop.order.controller.js
import { ShopOrderService } from "../service/shop.order.service.js";

const shopOrderService = new ShopOrderService();

export const getShopOrders = async (req, res) => {
  try {
    const { shopId } = req.params;
    const orders = await shopOrderService.getOrdersByShop(shopId);
    res.status(200).json({ success: true, data: orders });
  } catch (err) {
    console.error("getShopOrders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch shop orders" });
  }
};

export const getShopOrderDetails = async (req, res) => {
  try {
    const { shopId, orderId } = req.params;
    const details = await shopOrderService.getOrderDetails(shopId, orderId);
    if (!details) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.status(200).json({ success: true, data: details });
  } catch (err) {
    console.error("getShopOrderDetails error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch order details" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { shopId, orderId } = req.params;
    const { order_status } = req.body;
    const result = await shopOrderService.updateStatus(shopId, orderId, order_status);
    res.status(200).json({ success: true, message: "Order status updated", data: result });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ success: false, message: err.message || "Failed to update status" });
  }
};
