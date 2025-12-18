import { poolPromise } from "../config/db.config.js";
import sql from "mssql";

export class CategoryRepository {
  /**
   * Get all distinct categories from active shops
   * @returns {Array} List of categories
   */
  async findAll() {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
          SELECT 
    c.cat_id,
    c.name,
    c.description,
    COUNT(s.shop_id) AS shops
FROM dukaan.Categories c
LEFT JOIN dukaan.Shops s ON s.cat_id = c.cat_id
GROUP BY 
    c.cat_id,
    c.name,
    c.description;
        `);

      return result.recordset;
    } catch (error) {
      console.error("Database error in findAll categories:", error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Get shops by category
   * @param {string} category - Category name
   * @param {Object} options - Pagination options
   * @returns {Object} Shops with pagination
   */
  async getShopsByCategory(category, options = {}) {
    try {
      const { page = 1, limit = 20, search = "" } = options;
      const offset = (page - 1) * limit;
      const pool = await poolPromise;

      let searchCondition = "";
      if (search) {
        searchCondition = `AND (s.name LIKE @search OR s.description LIKE @search)`;
      }

      // Get total count
      const countResult = await pool
        .request()
        .input("category", sql.NVarChar(100), category)
        .input("search", sql.NVarChar, `%${search}%`).query(`
          SELECT COUNT(*) as total
          FROM dukaan.Shops s
          WHERE s.category = @category 
            AND s.is_deleted = 0 
            AND s.is_active = 1
            ${searchCondition}
        `);

      const total = countResult.recordset[0].total;

      // Get shops
      const shopsResult = await pool
        .request()
        .input("category", sql.NVarChar(100), category)
        .input("search", sql.NVarChar, `%${search}%`)
        .input("limit", sql.Int, limit)
        .input("offset", sql.Int, offset).query(`
          SELECT 
            s.shop_id,
            s.owner_id,
            s.name,
            s.description,
            s.category,
            s.address,
            s.pincode,
            s.latitude,
            s.longitude,
            s.is_active,
            s.image_url,
            s.created_at,
            u.name as owner_name
          FROM dukaan.Shops s
          INNER JOIN dukaan.Users u ON s.owner_id = u.user_id
          WHERE s.category = @category 
            AND s.is_deleted = 0 
            AND s.is_active = 1
            ${searchCondition}
          ORDER BY s.created_at DESC
          OFFSET @offset ROWS
          FETCH NEXT @limit ROWS ONLY
        `);

      return {
        shops: shopsResult.recordset,
        pagination: {
          total: total,
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error("Database error in getShopsByCategory:", error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }
}
