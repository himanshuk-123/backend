import { OrderService } from "../service/order.service.js";
import { ValidationError } from "../service/user.service.js";

const orderService = new OrderService();

/**
 * @route   POST /api/orders
 * @desc    Place new order from cart
 * @access  Private
 */
export const placeOrder = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { shop_id, payment_method = "COD" } = req.body;

    if (!shop_id) {
      return res.status(400).json({
        success: false,
        message: "Shop ID is required to place an order",
      });
    }

    const order = await orderService.placeOrder(
      userId,
      shop_id,
      payment_method
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });

  } catch (error) {
    console.error("Error in placeOrder:", error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};


/**
 * @route   GET /api/orders
 * @desc    Get all orders of logged in user
 * @access  Private
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const orders = await orderService.getOrdersByUser(userId);

    res.status(200).json({
      success: true,
      data: orders,
    });

  } catch (error) {
    console.error("Error in getUserOrders:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};


/**
 * @route   GET /api/orders/:orderId
 * @desc    Get order details
 * @access  Private
 */
export const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { orderId } = req.params;

    const order = await orderService.getOrderDetails(userId, orderId);

    res.status(200).json({
      success: true,
      data: order,
    });

  } catch (error) {
    console.error("Error in getOrderDetails:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
    });
  }
};
