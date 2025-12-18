import { poolPromise } from '../config/db.config.js';
import sql from 'mssql';

export class ShopDashboardRepository {

  async getDashboardData(shopId) {
    try {
      const pool = await poolPromise;

      // 1. Total products in this shop
      const totalProductsResult = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT COUNT(DISTINCT product_id) AS totalProducts
          FROM dukaan.Inventory
          WHERE shop_id = @shopId
            AND is_deleted = 0
        `);

      const totalProducts = totalProductsResult.recordset[0]?.totalProducts || 0;


      // 2. Total stock
      const totalStockResult = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT ISNULL(SUM(stock_quantity), 0) AS totalStock
          FROM dukaan.Inventory
          WHERE shop_id = @shopId
            AND is_deleted = 0
        `);

      const totalStock = totalStockResult.recordset[0]?.totalStock || 0;


      // 3. Total orders
      const totalOrdersResult = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT COUNT(*) AS totalOrders
          FROM dukaan.Orders
          WHERE shop_id = @shopId
        `);

      const totalOrders = totalOrdersResult.recordset[0]?.totalOrders || 0;


      // 4. Pending / processing orders
      const pendingOrdersResult = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT COUNT(*) AS pendingOrders
          FROM dukaan.Orders
          WHERE shop_id = @shopId
            AND order_status = 'processing'
        `);

      const pendingOrders = pendingOrdersResult.recordset[0]?.pendingOrders || 0;


      // 5. Completed orders
      const completedOrdersResult = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT COUNT(*) AS completedOrders
          FROM dukaan.Orders
          WHERE shop_id = @shopId
            AND order_status = 'delivered'
        `);

      const completedOrders = completedOrdersResult.recordset[0]?.completedOrders || 0;


      // 6. Total revenue
      const totalRevenueResult = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT ISNULL(SUM(total_amount), 0) AS totalRevenue
          FROM dukaan.Orders
          WHERE shop_id = @shopId
            AND order_status = 'delivered'
        `);

      const totalRevenue = totalRevenueResult.recordset[0]?.totalRevenue || 0;


      // 7. Best selling product
      const bestProductResult = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT TOP 1
            oi.product_id,
            p.name,
            SUM(oi.quantity) AS total_sold
          FROM dukaan.OrderItems oi
          JOIN dukaan.Orders o 
            ON oi.order_id = o.order_id
          JOIN dukaan.Products p 
            ON oi.product_id = p.product_id
          WHERE o.shop_id = @shopId
          GROUP BY oi.product_id, p.name
          ORDER BY total_sold DESC
        `);

      const bestProduct = bestProductResult.recordset[0] || null;


      // 8. Recent orders
      const recentOrdersResult = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT TOP 5
            order_id,
            total_amount,
            item_count,
            order_status,
            payment_status,
            created_at
          FROM dukaan.Orders
          WHERE shop_id = @shopId
          ORDER BY created_at DESC
        `);

      const recentOrders = recentOrdersResult.recordset || [];


      // Final response object
      return {
        totalProducts,
        totalStock,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        bestProduct,
        recentOrders
      };

    } catch (error) {
      console.error('Error in ShopDashboardRepository:', error);
      throw new Error('Failed to fetch shop dashboard data');
    }
  }

  async isShopOwner(shopId, userId) {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('shopId', sql.Int, shopId)
      .input('userId', sql.Int, userId)
      .query(`
        SELECT shop_id 
        FROM dukaan.Shops
        WHERE shop_id = @shopId
        AND owner_id = @userId
        AND is_deleted = 0
      `);

    return result.recordset.length > 0;

  } catch (error) {
    console.error('Error in isShopOwner:', error);
    throw new Error('Failed to verify shop ownership');
  }
}

  
}
