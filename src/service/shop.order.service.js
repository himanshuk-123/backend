// shop.order.service.js
import { ShopOrderRepository } from "../repositories/shop.order.repository.js";
import { ValidationError } from "./user.service.js";

export class ShopOrderService {
  constructor() {
    this.repo = new ShopOrderRepository();
  }

  async getOrdersByShop(shopId) {
    const rows = await this.repo.getOrdersByShopId(shopId);
    // Map rows into lightweight list for frontend
    return rows.map(r => ({
      order_id: r.order_id,
      user_id: r.user_id,
      shop_id: r.shop_id,
      total_amount: r.total_amount,
      item_count: r.item_count,
      order_status: r.order_status,
      payment_status: r.payment_status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      customer: {
        name: r.customer_name,
        phone: r.customer_phone
      },
      preview: {
        name: r.first_item_name,
        qty: r.first_item_qty,
        image: r.first_item_image
      }
    }));
  }

  async getOrderDetails(shopId, orderId) {
    const details = await this.repo.getOrderDetails(shopId, orderId);
    if (!details) return null;

    // normalize field names (simple mapping)
    return {
      order: {
        order_id: details.order.order_id,
        user_id: details.order.user_id,
        shop_id: details.order.shop_id,
        total_amount: details.order.total_amount,
        item_count: details.order.item_count,
        order_status: details.order.order_status,
        payment_status: details.order.payment_status,
        created_at: details.order.created_at,
        updated_at: details.order.updated_at,
        customer: {
          name: details.order.customer_name,
          phone: details.order.customer_phone
        }
      },
      items: details.items.map(i => ({
        order_item_id: i.order_item_id,
        product_id: i.product_id,
        product_name: i.product_name,
        image_url: i.image_url,
        quantity: i.quantity,
        price_at_time: i.price_at_time
      })),
      address: details.address ? {
        order_address_id: details.address.order_address_id,
        full_name: details.address.full_name,
        phone: details.address.phone,
        house: details.address.house,
        city: details.address.city,
        state: details.address.state,
        pincode: details.address.pincode,
        landmark: details.address.landmark
      } : null,
      payment: details.payment ? {
        payment_id: details.payment.payment_id,
        amount: details.payment.amount,
        payment_method: details.payment.payment_method,
        transaction_id: details.payment.transaction_id,
        payment_status: details.payment.payment_status,
        created_at: details.payment.created_at
      } : null
    };
  }

  async updateStatus(shopId, orderId, status) {
    // Allowed statuses — keep backend allowed set but we will accept common values
    const allowed = ["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (!allowed.includes(status)) {
      throw new ValidationError("Invalid order status");
    }
    return await this.repo.updateOrderStatus(shopId, orderId, status);
  }
}
