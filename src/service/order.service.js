import { OrderRepository } from "../repositories/order.repository.js";
import { CartRepository } from "../repositories/cart.repositories.js";
import { UserAddressRepository } from "../repositories/userAddress.repository.js";
import { ValidationError } from "./user.service.js";
import { poolPromise } from "../config/db.config.js";
import sql from "mssql";

export class OrderService {

  constructor() {
    this.orderRepo = new OrderRepository();
    this.cartRepo = new CartRepository();
    this.addressRepo = new UserAddressRepository();
  }

  async placeOrder(userId, shopId, paymentMethod = "COD") {

    if (!userId) throw new ValidationError("User ID required");

    const cart = await this.cartRepo.getCartWithItems(userId);

    if (!cart || cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    const defaultAddress = await this.addressRepo.getDefaultAddress(userId);
    if (!defaultAddress) {
      throw new ValidationError("No default address found");
    }

    let total = 0;
    const orderItems = cart.items.map(item => {
      const price =
        item.product.selling_price ??
        item.product.base_price ??
        0;

      total += price * item.quantity;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        price: price
      };
    });

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();

      // 1️⃣ Create order
      const order = await this.orderRepo.createOrder(
        userId,
        shopId,
        total,
        orderItems.length,
        transaction
      );

      // 2️⃣ Insert items
      await this.orderRepo.insertOrderItems(order.order_id, orderItems, transaction);

      // 3️⃣ Save address snapshot
      await this.orderRepo.insertOrderAddress(order.order_id, defaultAddress, transaction);

      // 4️⃣ Payment record
      await this.orderRepo.createPayment(
        order.order_id,
        total,
        paymentMethod,
        transaction
      );

      // 5️⃣ Reduce stock
      await this.orderRepo.updateInventory(orderItems, transaction);

      // 6️⃣ Clear cart
      await this.orderRepo.clearCart(cart.cart_id, transaction);

      await transaction.commit();

      return {
        order_id: order.order_id,
        total,
        item_count: orderItems.length,
        address: defaultAddress
      };

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async getOrdersByUser(userId) {
    return await this.orderRepo.getOrdersByUserId(userId);
  }

  async getOrderDetails(userId, orderId) {
    const order = await this.orderRepo.getOrderById(orderId);
    
    if (!order) {
      return null;
    }

    if (order.user_id !== userId) {
      throw new ValidationError("Unauthorized access to order");
    }

    const items = await this.orderRepo.getOrderItems(orderId);
    const address = await this.orderRepo.getOrderAddress(orderId);
    const payment = await this.orderRepo.getOrderPayment(orderId);

    return {
      ...order,
      items,
      address: address,
      payment: payment
    };
  }

  async cancelOrderByUser(userId, orderId) {
  const order = await this.orderRepo.getOrderById(orderId);

  if (!order) throw new ValidationError("Order not found");

  if (order.user_id !== userId)
    throw new ValidationError("Unauthorized cancellation");

  if (order.order_status === "DELIVERED")
    throw new ValidationError("Delivered orders cannot be cancelled");

  if (order.order_status.includes("CANCELLED"))
    throw new ValidationError("Order already cancelled");

  // Update order status
  await this.orderRepo.updateOrderStatus(orderId, "CANCELLED_BY_USER");

  // OPTIONAL → Restore inventory
  const items = await this.orderRepo.getOrderItems(orderId);
  await this.orderRepo.restoreInventory(items);

  return { orderId, status: "CANCELLED_BY_USER" };
}

}
