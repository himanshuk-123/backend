// shop.order.repository.js
import { poolPromise } from "../config/db.config.js";
import sql from "mssql";

export class ShopOrderRepository {

  // Lightweight list for shop - includes first item preview
  async getOrdersByShopId(shopId) {
    const pool = await poolPromise;

    // Main orders + customer basic info
    // Subquery to get first item name and quantity (preview)
    const result = await pool.request()
      .input("shopId", sql.Int, shopId)
      .query(`
        SELECT 
          o.order_id,
          o.user_id,
          o.shop_id,
          o.total_amount,
          o.item_count,
          o.order_status,
          o.payment_status,
          o.created_at,
          o.updated_at,
          u.name AS customer_name,
          u.phone_number AS customer_phone,
          -- first item preview (may be NULL)
          fi.name AS first_item_name,
          fi.quantity AS first_item_qty,
          fi.image_url AS first_item_image
        FROM dukaan.Orders o
        LEFT JOIN dukaan.Users u ON u.user_id = o.user_id
        OUTER APPLY (
          SELECT TOP 1 
            p.name,
            oi.quantity,
            p.image_url
          FROM dukaan.OrderItems oi
          JOIN dukaan.Products p ON p.product_id = oi.product_id
          WHERE oi.order_id = o.order_id
          ORDER BY oi.order_item_id ASC
        ) fi
        WHERE o.shop_id = @shopId
        ORDER BY o.created_at DESC
      `);

    return result.recordset;
  }

  // Full order details: order row + items + address + payment + customer
  async getOrderDetails(shopId, orderId) {
    const pool = await poolPromise;

    // 1) order row with customer
    const orderReq = await pool.request()
      .input("shopId", sql.Int, shopId)
      .input("orderId", sql.Int, orderId)
      .query(`
        SELECT o.*, u.name AS customer_name, u.phone_number as customer_phone
        FROM dukaan.Orders o
        LEFT JOIN dukaan.Users u ON u.user_id = o.user_id
        WHERE o.order_id = @orderId AND o.shop_id = @shopId
      `);

    const order = orderReq.recordset[0];
    if (!order) return null;

    // 2) items
    const itemsReq = await pool.request()
      .input("orderId", sql.Int, orderId)
      .query(`
        SELECT oi.order_item_id, oi.order_id, oi.product_id, oi.quantity, oi.price_at_time,
               p.name, p.image_url
        FROM dukaan.OrderItems oi
        LEFT JOIN dukaan.Products p ON p.product_id = oi.product_id
        WHERE oi.order_id = @orderId
      `);
    const items = itemsReq.recordset;

    // 3) address (snapshot)
    const addrReq = await pool.request()
      .input("orderId", sql.Int, orderId)
      .query(`SELECT * FROM dukaan.OrderAddresses WHERE order_id = @orderId`);
    const address = addrReq.recordset[0] || null;

    // 4) payment
    const payReq = await pool.request()
      .input("orderId", sql.Int, orderId)
      .query(`SELECT * FROM dukaan.Payments WHERE order_id = @orderId ORDER BY created_at DESC`);
    const payment = payReq.recordset[0] || null;

    return {
      order,
      items,
      address,
      payment
    };
  }

  // Update order status (unchanged)
  async updateOrderStatus(shopId, orderId, status) {
    const pool = await poolPromise;

    await pool.request()
      .input("status", sql.NVarChar, status)
      .input("orderId", sql.Int, orderId)
      .input("shopId", sql.Int, shopId)
      .query(`
        UPDATE dukaan.Orders
        SET order_status = @status, updated_at = GETDATE()
        WHERE order_id = @orderId AND shop_id = @shopId
      `);

    return { order_id: orderId, status };
  }
}
