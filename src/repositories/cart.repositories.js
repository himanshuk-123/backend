import { poolPromise } from '../config/db.config.js';
import sql from 'mssql';

export class CartRepository {
  /**
   * Get or create cart for user
   * @param {number} userId - User ID
   * @returns {Object} Cart data
   */
  async getOrCreateCart(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      const pool = await poolPromise;
      const request = pool.request();
      request.input('userId', sql.Int, userId);
      // First, try to find existing cart
      const query = `
        SELECT cart_id, user_id, is_active, created_at, updated_at
        FROM dukaan.Carts
        WHERE user_id = @userId AND is_active = 1
      `;
      const result = await request.query(query);
      if (result.recordset.length > 0) {
        return result.recordset[0];
      }
      // Create new cart if doesn't exist
      const insertQuery = `
        INSERT INTO dukaan.Carts (user_id, is_active)
        OUTPUT INSERTED.cart_id, INSERTED.user_id, INSERTED.is_active, INSERTED.created_at, INSERTED.updated_at
        VALUES (@userId, 1)
      `;
      const insertRequest = pool.request();
      insertRequest.input('userId', sql.Int, userId);
      const insertResult = await insertRequest.query(insertQuery);
      return insertResult.recordset[0];
    } catch (error) {
      console.error('Database error in getOrCreateCart:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Get cart with items
   * @param {number} userId - User ID
   * @returns {Object|null} Cart with items or null
   */
async getCartWithItems(userId) {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const pool = await poolPromise;
    const request = pool.request();
    request.input("userId", sql.Int, userId);

    const query = `
      SELECT 
        c.cart_id,
        c.user_id,
        c.is_active,
        c.created_at,
        c.updated_at,

        ci.item_id,
        ci.product_id,
        ci.quantity,
        ci.created_at AS item_created_at,

        p.name AS product_name,
        p.description AS product_description,
        p.Base_Price AS base_price,
        p.image_url AS product_image,
         i.shop_id as product_shop_id,
        i.stock_quantity AS product_stock,
        i.selling_price AS product_price
      FROM dukaan.Carts c
      LEFT JOIN dukaan.CartItems ci ON c.cart_id = ci.cart_id
      LEFT JOIN dukaan.Products p ON ci.product_id = p.product_id
      LEFT JOIN dukaan.Inventory i ON ci.product_id = i.product_id AND i.is_deleted = 0
      WHERE c.user_id = @userId AND c.is_active = 1
      ORDER BY ci.created_at DESC
    `;

    const result = await request.query(query);

    if (result.recordset.length === 0) {
      return null;
    }

    const cartData = {
      cart_id: result.recordset[0].cart_id,
      user_id: result.recordset[0].user_id,
      is_active: result.recordset[0].is_active,
      created_at: result.recordset[0].created_at,
      updated_at: result.recordset[0].updated_at,
      items: []
    };

    result.recordset.forEach((row) => {
      if (row.item_id) {
        cartData.items.push({
          item_id: row.item_id,
          product_id: row.product_id,
          quantity: row.quantity,
          created_at: row.item_created_at,

          product: {
            product_id: row.product_id,
            shop_id: row.product_shop_id, 
            name: row.product_name,
            description: row.product_description,
            base_price: parseFloat(row.base_price),
            selling_price: parseFloat(row.product_price),  // actual selling price
            stock_quantity: row.product_stock,
            image_url: row.product_image,
          }
        });
      }
    });

    return cartData;

  } catch (error) {
    console.error("Database error in getCartWithItems:", error);
    throw new Error(`Database operation failed: ${error.message}`);
  }
}


  /**
   * Add or update item in cart
   * @param {number} cartId - Cart ID
   * @param {number} productId - Product ID
   * @param {number} quantity - Quantity to add/update
   * @returns {Object} Cart item data
   */
  async addOrUpdateCartItem(cartId, productId, quantity) {
    try {
      const pool = await poolPromise;

      // Check if item already exists
      const checkResult = await pool.request()
        .input('cartId', sql.Int, cartId)
        .input('productId', sql.Int, productId)
        .query(`
          SELECT item_id, quantity
          FROM dukaan.CartItems
          WHERE cart_id = @cartId AND product_id = @productId
        `);

      if (checkResult.recordset.length > 0) {
        // Update existing item
        const newQuantity = checkResult.recordset[0].quantity + quantity;
        const updateResult = await pool.request()
          .input('cartId', sql.Int, cartId)
          .input('productId', sql.Int, productId)
          .input('quantity', sql.Int, newQuantity)
          .query(`
            UPDATE dukaan.CartItems
            SET quantity = @quantity
            OUTPUT INSERTED.item_id, INSERTED.cart_id, INSERTED.product_id, INSERTED.quantity, INSERTED.created_at
            WHERE cart_id = @cartId AND product_id = @productId
          `);

        // Update cart updated_at
        await pool.request()
          .input('cartId', sql.Int, cartId)
          .query(`UPDATE Carts SET updated_at = GETDATE() WHERE cart_id = @cartId`);

        return updateResult.recordset[0];
      } else {
        // Insert new item
        const insertResult = await pool.request()
          .input('cartId', sql.Int, cartId)
          .input('productId', sql.Int, productId)
          .input('quantity', sql.Int, quantity)
          .query(`
            INSERT INTO dukaan.CartItems (cart_id, product_id, quantity)
            OUTPUT INSERTED.item_id, INSERTED.cart_id, INSERTED.product_id, INSERTED.quantity, INSERTED.created_at
            VALUES (@cartId, @productId, @quantity)
          `);

        // Update cart updated_at
        await pool.request()
          .input('cartId', sql.Int, cartId)
          .query(`UPDATE Carts SET updated_at = GETDATE() WHERE cart_id = @cartId`);

        return insertResult.recordset[0];
      }
    } catch (error) {
      console.error('Database error in addOrUpdateCartItem:', error);
      
      // Handle unique constraint violation
      if (error.number === 2627) {
        throw new Error('Item already exists in cart');
      }
      
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Update cart item quantity
   * @param {number} cartId - Cart ID
   * @param {number} itemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Object|null} Updated cart item or null
   */
  async updateCartItemQuantity(cartId, itemId, quantity) {
    try {
      const pool = await poolPromise;

      if (quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      const result = await pool.request()
        .input('cartId', sql.Int, cartId)
        .input('itemId', sql.Int, itemId)
        .input('quantity', sql.Int, quantity)
        .query(`
          UPDATE CartItems
          SET quantity = @quantity
          OUTPUT INSERTED.item_id, INSERTED.cart_id, INSERTED.product_id, INSERTED.quantity, INSERTED.created_at
          WHERE cart_id = @cartId AND item_id = @itemId
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      // Update cart updated_at
      await pool.request()
        .input('cartId', sql.Int, cartId)
        .query(`UPDATE Carts SET updated_at = GETDATE() WHERE cart_id = @cartId`);

      return result.recordset[0];
    } catch (error) {
      console.error('Database error in updateCartItemQuantity:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Remove item from cart
   * @param {number} cartId - Cart ID
   * @param {number} itemId - Cart item ID
   * @returns {boolean} True if deleted
   */
  async removeCartItem(cartId, itemId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('cartId', sql.Int, cartId)
        .input('itemId', sql.Int, itemId)
        .query(`
          DELETE FROM CartItems
          WHERE cart_id = @cartId AND item_id = @itemId
        `);

      // Update cart updated_at
      await pool.request()
        .input('cartId', sql.Int, cartId)
        .query(`UPDATE Carts SET updated_at = GETDATE() WHERE cart_id = @cartId`);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Database error in removeCartItem:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Clear all items from cart
   * @param {number} cartId - Cart ID
   * @returns {boolean} True if cleared
   */
  async clearCart(cartId) {
    try {
      const pool = await poolPromise;

      await pool.request()
        .input('cartId', sql.Int, cartId)
        .query(`DELETE FROM dukaan.CartItems WHERE cart_id = @cartId`);

      // Update cart updated_at
      await pool.request()
        .input('cartId', sql.Int, cartId)
        .query(`UPDATE Carts SET updated_at = GETDATE() WHERE cart_id = @cartId`);

      return true;
    } catch (error) {
      console.error('Database error in clearCart:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

}

