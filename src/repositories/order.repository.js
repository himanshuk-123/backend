import { poolPromise } from "../config/db.config.js";
import sql from "mssql";

export class OrderRepository {

  // Create new order
  async createOrder(userId, shopId, total, itemCount, transaction) {
    const request = transaction ? new sql.Request(transaction) : (await poolPromise).request();

    const result = await request
      .input("userId", sql.Int, userId)
      .input("shopId", sql.Int, shopId)
      .input("total", sql.Decimal(10, 2), total)
      .input("itemCount", sql.Int, itemCount)
      .query(`
        INSERT INTO Orders (user_id, shop_id, total_amount, item_count)
        OUTPUT INSERTED.*
        VALUES (@userId, @shopId, @total, @itemCount)
      `);

    return result.recordset[0];
  }

  // Insert order items
  async insertOrderItems(orderId, items, transaction) {
    for (let item of items) {
      const request = transaction ? new sql.Request(transaction) : (await poolPromise).request();
      await request
        .input("order_id", sql.Int, orderId)
        .input("product_id", sql.Int, item.product_id)
        .input("quantity", sql.Int, item.quantity)
        .input("price", sql.Decimal(10,2), item.price)
        .query(`
          INSERT INTO OrderItems(order_id, product_id, quantity, price_at_time)
          VALUES(@order_id, @product_id, @quantity, @price)
        `);
    }
  }

  // Save order address
  async insertOrderAddress(orderId, address, transaction) {
    const request = transaction ? new sql.Request(transaction) : (await poolPromise).request();

    await request
      .input("order_id", sql.Int, orderId)
      .input("full_name", sql.NVarChar, address.full_name)
      .input("phone", sql.NVarChar, address.phone)
      .input("house", sql.NVarChar, address.house)
      .input("landmark", sql.NVarChar, address.landmark)
      .input("city", sql.NVarChar, address.city)
      .input("state", sql.NVarChar, address.state)
      .input("pincode", sql.NVarChar, address.pincode)
      .query(`
        INSERT INTO OrderAddresses
        (order_id, full_name, phone, house, landmark, city, state, pincode)
        VALUES
        (@order_id, @full_name, @phone, @house, @landmark, @city, @state, @pincode)
      `);
  }

  // Add payment record
  async createPayment(orderId, amount, method, transaction) {
    const request = transaction ? new sql.Request(transaction) : (await poolPromise).request();

    await request
      .input("order_id", sql.Int, orderId)
      .input("amount", sql.Decimal(10, 2), amount)
      .input("method", sql.NVarChar, method)
      .query(`
        INSERT INTO Payments(order_id, amount, payment_method)
        VALUES(@order_id, @amount, @method)
      `);
  }

  // Reduce stock
  async updateInventory(items, transaction) {
    for (let item of items) {
      const request = transaction ? new sql.Request(transaction) : (await poolPromise).request();
      await request
        .input("product_id", sql.Int, item.product_id)
        .input("qty", sql.Int, item.quantity)
        .query(`
          UPDATE Inventory
          SET stock_quantity = stock_quantity - @qty
          WHERE product_id = @product_id AND stock_quantity >= @qty
        `);
    }
  }

  // Clear cart
  async clearCart(cartId, transaction) {
    const request = transaction ? new sql.Request(transaction) : (await poolPromise).request();

    await request
      .input("cart_id", sql.Int, cartId)
      .query(`DELETE FROM CartItems WHERE cart_id = @cart_id`);
  }

  // Get orders by user
  async getOrdersByUserId(userId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("userId", sql.Int, userId)
      .query(`
        SELECT o.*, s.name, s.image_url as shop_image
        FROM Orders o
        JOIN Shops s ON o.shop_id = s.shop_id
        WHERE o.user_id = @userId
        ORDER BY o.created_at DESC
      `);
    return result.recordset;
  }

  // Get order by ID
  async getOrderById(orderId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("orderId", sql.Int, orderId)
      .query(`
        SELECT o.*, s.shop_name, s.image_url as shop_image
        FROM Orders o
        JOIN Shops s ON o.shop_id = s.shop_id
        WHERE o.order_id = @orderId
      `);
    return result.recordset[0];
  }

  // Get order items
  async getOrderItems(orderId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("orderId", sql.Int, orderId)
      .query(`
        SELECT oi.*, p.product_name, p.image_url
        FROM OrderItems oi
        JOIN Products p ON oi.product_id = p.product_id
        WHERE oi.order_id = @orderId
      `);
    return result.recordset;
  }

  // Get order address
  async getOrderAddress(orderId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("orderId", sql.Int, orderId)
      .query(`SELECT * FROM OrderAddresses WHERE order_id = @orderId`);
    return result.recordset[0];
  }

  // Get order payment
  async getOrderPayment(orderId) {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("orderId", sql.Int, orderId)
      .query(`SELECT * FROM Payments WHERE order_id = @orderId`);
    return result.recordset[0];
  }

}
