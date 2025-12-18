import { poolPromise } from '../config/db.config.js';
import sql from 'mssql';

export class ProductRepository {

  /* -------------------------------------------------------------------------- */
  /*                FIND ALL PRODUCTS (WITH INVENTORY & SHOP)                  */
  /* -------------------------------------------------------------------------- */

  async findAll(options = {}) {
    try {
      const { page = 1, limit = 20, search = '', shop_id = null } = options;
      const offset = (page - 1) * limit;
      const pool = await poolPromise;

      let whereConditions = ['i.is_deleted = 0']; // inventory must not be deleted
      let searchCondition = '';

      if (shop_id) whereConditions.push('i.shop_id = @shop_id');
      if (search) searchCondition = `AND (p.name LIKE @search OR p.description LIKE @search)`;

      const whereClause = whereConditions.join(' AND ');

      // COUNT QUERY
      const countReq = pool.request();
      if (shop_id) countReq.input('shop_id', sql.Int, shop_id);
      if (search) countReq.input('search', sql.NVarChar, `%${search}%`);

      const countQuery = `
        SELECT COUNT(DISTINCT p.product_id) AS total
        FROM dukaan.Products p
        INNER JOIN dukaan.Inventory i 
          ON p.product_id = i.product_id AND i.is_deleted = 0
        WHERE ${whereClause}
        ${searchCondition}
      `;

      const countResult = await countReq.query(countQuery);
      const total = countResult.recordset[0].total;

      // DATA QUERY
      const dataReq = pool.request()
        .input('limit', sql.Int, limit)
        .input('offset', sql.Int, offset);

      if (shop_id) dataReq.input('shop_id', sql.Int, shop_id);
      if (search) dataReq.input('search', sql.NVarChar, `%${search}%`);

      const dataQuery = `
        SELECT 
          p.product_id,
          p.name,
          p.description,
          p.Base_Price,
          p.image_url,
          p.created_at,

          i.id AS inventory_id,
          i.shop_id,
          i.stock_quantity,
          i.selling_price,

          s.name AS shop_name
        FROM dukaan.Products p
        INNER JOIN dukaan.Inventory i 
          ON p.product_id = i.product_id AND i.is_deleted = 0
        INNER JOIN dukaan.Shops s 
          ON i.shop_id = s.shop_id
        WHERE ${whereClause}
        ${searchCondition}
        ORDER BY p.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `;

      const productsResult = await dataReq.query(dataQuery);

      return {
        products: productsResult.recordset,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Database error in findAll:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*               FIND PRODUCTS BY SHOP (USES findAll())                      */
  /* -------------------------------------------------------------------------- */

  async findByShopId(shopId, options = {}) {
    try {
      return await this.findAll({ ...options, shop_id: shopId });
    } catch (error) {
      console.error('Database error in findByShopId:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*              FIND PRODUCT BY ID (OPTIONAL SHOP + INVENTORY)               */
  /* -------------------------------------------------------------------------- */

  async findById(productId, shopId = null) {
    try {
      const pool = await poolPromise;

      if (shopId) {
        const result = await pool.request()
          .input('productId', sql.Int, productId)
          .input('shopId', sql.Int, shopId)
          .query(`
            SELECT 
              p.product_id,
              p.name,
              p.description,
              p.Base_Price,
              p.image_url,
              p.created_at,

              i.id AS inventory_id,
              i.shop_id,
              i.stock_quantity,
              i.selling_price,

              s.name AS shop_name,
              s.category AS shop_category
            FROM dukaan.Products p
            LEFT JOIN dukaan.Inventory i 
              ON p.product_id = i.product_id 
              AND i.shop_id = @shopId 
              AND i.is_deleted = 0
            LEFT JOIN dukaan.Shops s 
              ON i.shop_id = s.shop_id
            WHERE p.product_id = @productId AND p.is_deleted = 0
          `);

        return result.recordset[0] || null;
      }

      // Without shop — basic product only
      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .query(`
          SELECT 
            product_id,
            name,
            description,
            Base_Price,
            image_url,
            created_at
          FROM dukaan.Products
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                    CREATE PRODUCT (PRODUCTS TABLE)                         */
  /* -------------------------------------------------------------------------- */

  async create(productData) {
    try {
      const { name, description, Base_Price, image_url = null } = productData;
      const pool = await poolPromise;

      const result = await pool.request()
        .input('name', sql.NVarChar(255), name)
        .input('description', sql.NVarChar(sql.MAX), description || null)
        .input('Base_Price', sql.Decimal(10, 2), Base_Price)
        .input('image_url', sql.NVarChar(500), image_url)
        .query(`
          INSERT INTO dukaan.Products (name, description, Base_Price, image_url   )
          OUTPUT INSERTED.*
          VALUES (@name, @description, @Base_Price, @image_url)
        `);

      return result.recordset[0];

    } catch (error) {
      console.error('Database error in create product:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                    UPDATE PRODUCT (PRODUCTS TABLE)                         */
  /* -------------------------------------------------------------------------- */

  async update(productId, productData) {
    try {
      const pool = await poolPromise;

      let queryParts = [];
      const req = pool.request().input('productId', sql.Int, productId);

      if (productData.name !== undefined) {
        req.input('name', sql.NVarChar(255), productData.name);
        queryParts.push('name = @name');
      }

      if (productData.description !== undefined) {
        req.input('description', sql.NVarChar(sql.MAX), productData.description);
        queryParts.push('description = @description');
      }

      if (productData.Base_Price !== undefined) {
        req.input('Base_Price', sql.Decimal(10, 2), productData.Base_Price);
        queryParts.push('Base_Price = @Base_Price');
      }

      if (queryParts.length === 0) {
        throw new Error('No fields to update');
      }

      const result = await req.query(`
        UPDATE dukaan.Products
        SET ${queryParts.join(', ')}
        OUTPUT INSERTED.*
        WHERE product_id = @productId
      `);

      return result.recordset[0] || null;

    } catch (error) {
      console.error('Database error in update product:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*               UPDATE IMAGE URL IN PRODUCT TABLE                            */
  /* -------------------------------------------------------------------------- */

  async updateImageUrl(productId, imageUrl) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .input('imageUrl', sql.NVarChar(500), imageUrl)
        .query(`
          UPDATE dukaan.Products
          SET image_url = @imageUrl
          WHERE product_id = @productId
        `);

      return result.rowsAffected[0] > 0;

    } catch (error) {
      console.error('Database error in updateImageUrl:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                  ADD PRODUCT TO SHOP INVENTORY                             */
  /* -------------------------------------------------------------------------- */

  async addToInventory(shopId, productId, inventoryData) {
    try {
      const { stock_quantity, selling_price,unit } = inventoryData;
      const pool = await poolPromise;

      const result = await pool.request()
        .input('shopId', sql.Int, shopId)
        .input('productId', sql.Int, productId)
        .input('stock_quantity', sql.Int, stock_quantity)
        .input('selling_price', sql.Decimal(10, 2), selling_price)
        .input('unit', sql.NVarChar(50), unit)
        .query(`
          INSERT INTO dukaan.Inventory (shop_id, product_id, stock_quantity, selling_price,unit)
          OUTPUT INSERTED.*
          VALUES (@shopId, @productId, @stock_quantity, @selling_price,@unit)
        `);

      return result.recordset[0];

    } catch (error) {
      if (error.number === 2627) {
        throw new Error('Product already exists in this shop inventory');
      }
      console.error('Database error in addToInventory:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                   UPDATE SHOP INVENTORY ENTRY                               */
  /* -------------------------------------------------------------------------- */

  async updateInventory(inventoryId, inventoryData) {
    try {
      const pool = await poolPromise;
      let updates = [];
      const req = pool.request().input('inventoryId', sql.Int, inventoryId);

      if (inventoryData.stock_quantity !== undefined) {
        req.input('stock_quantity', sql.Int, inventoryData.stock_quantity);
        updates.push('stock_quantity = @stock_quantity');
      }

      if (inventoryData.selling_price !== undefined) {
        req.input('selling_price', sql.Decimal(10, 2), inventoryData.selling_price);
        updates.push('selling_price = @selling_price');
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      const query = `
        UPDATE dukaan.Inventory
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE id = @inventoryId AND is_deleted = 0
      `;

      const result = await req.query(query);
      return result.recordset[0] || null;

    } catch (error) {
      console.error('Database error in updateInventory:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*      GET INVENTORY ENTRY BY SHOP + PRODUCT (USEFUL FOR CART CHECK)        */
  /* -------------------------------------------------------------------------- */

  async getInventoryByShopAndProduct(shopId, productId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('shopId', sql.Int, shopId)
        .input('productId', sql.Int, productId)
        .query(`
          SELECT *
          FROM dukaan.Inventory
          WHERE shop_id = @shopId 
            AND product_id = @productId
            AND is_deleted = 0
        `);

      return result.recordset[0] || null;

    } catch (error) {
      console.error('Database error in getInventoryByShopAndProduct:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                        CHECK PRODUCT AVAILABILITY                          */
  /* -------------------------------------------------------------------------- */

  async checkAvailability(productId, shopId = null) {
    try {
      const pool = await poolPromise;

      if (shopId) {
        const result = await pool.request()
          .input('productId', sql.Int, productId)
          .input('shopId', sql.Int, shopId)
          .query(`
            SELECT 
              p.product_id,
              i.stock_quantity,
              i.selling_price,
              i.is_deleted
            FROM dukaan.Products p
            LEFT JOIN dukaan.Inventory i 
              ON p.product_id = i.product_id 
              AND i.shop_id = @shopId
            WHERE p.product_id = @productId
          `);

        if (!result.recordset[0]) return null;

        const row = result.recordset[0];
        return {
          exists: true,
          available: row.stock_quantity > 0 && row.is_deleted === false,
          stock_quantity: row.stock_quantity || 0,
          selling_price: row.selling_price || null,
          in_shop: row.stock_quantity != null
        };
      }

      // Check availability across all shops
      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .query(`
          SELECT 
            p.product_id,
            SUM(CASE WHEN i.is_deleted = 0 THEN i.stock_quantity ELSE 0 END) AS total_stock
          FROM dukaan.Products p
          LEFT JOIN dukaan.Inventory i 
            ON p.product_id = i.product_id
          WHERE p.product_id = @productId AND p.is_deleted = 0
          GROUP BY p.product_id
        `);

      if (!result.recordset[0]) return null;

      const data = result.recordset[0];

      return {
        exists: true,
        available: data.total_stock > 0,
        stock_quantity: data.total_stock
      };

    } catch (error) {
      console.error('Database error in checkAvailability:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                    VERIFY PRODUCT BELONGS TO OWNER                         */
  /* -------------------------------------------------------------------------- */

  async isProductOwner(productId, ownerId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('productId', sql.Int, productId)
        .input('ownerId', sql.Int, ownerId)
        .query(`
          SELECT COUNT(*) AS count
          FROM dukaan.Inventory i
          INNER JOIN dukaan.Shops s 
            ON i.shop_id = s.shop_id
          WHERE i.product_id = @productId
            AND i.is_deleted = 0
            AND s.owner_id = @ownerId
        `);

      return result.recordset[0].count > 0;

    } catch (error) {
      console.error('Database error in isProductOwner:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                    VERIFY INVENTORY ENTRY BELONGS TO OWNER                 */
  /* -------------------------------------------------------------------------- */

  async isInventoryOwner(inventoryId, ownerId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('inventoryId', sql.Int, inventoryId)
        .input('ownerId', sql.Int, ownerId)
        .query(`
          SELECT COUNT(*) AS count
          FROM dukaan.Inventory i
          INNER JOIN dukaan.Shops s 
            ON i.shop_id = s.shop_id
          WHERE i.id = @inventoryId
            AND i.is_deleted = 0
            AND s.owner_id = @ownerId
        `);

      return result.recordset[0].count > 0;

    } catch (error) {
      console.error('Database error in isInventoryOwner:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*               FIND PRODUCTS BY OWNER (MULTIPLE SHOPS)                      */
  /* -------------------------------------------------------------------------- */

  async findByOwner(ownerId, shopId = null, options = {}) {
    try {
      const { page = 1, limit = 20, search = '' } = options;
      const offset = (page - 1) * limit;
      const pool = await poolPromise;

      let whereConditions = [
        'i.is_deleted = 0',
        's.owner_id = @ownerId'
      ];

      let searchCondition = '';
      if (shopId) whereConditions.push('i.shop_id = @shopId');
      if (search) searchCondition = `AND (p.name LIKE @search OR p.description LIKE @search)`;

      const whereClause = whereConditions.join(' AND ');

      // Count Query
      const countReq = pool.request().input('ownerId', sql.Int, ownerId);
      if (shopId) countReq.input('shopId', sql.Int, shopId);
      if (search) countReq.input('search', sql.NVarChar, `%${search}%`);

      const countResult = await countReq.query(`
        SELECT COUNT(DISTINCT p.product_id) AS total
        FROM dukaan.Products p
        INNER JOIN dukaan.Inventory i ON p.product_id = i.product_id AND i.is_deleted = 0
        INNER JOIN dukaan.Shops s ON i.shop_id = s.shop_id
        WHERE ${whereClause}
        ${searchCondition}
      `);

      const total = countResult.recordset[0].total;

      // Fetch products
      const req = pool.request()
        .input('ownerId', sql.Int, ownerId)
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, limit);

      if (shopId) req.input('shopId', sql.Int, shopId);
      if (search) req.input('search', sql.NVarChar, `%${search}%`);

      const productsResult = await req.query(`
        SELECT 
          p.product_id,
          p.name,
          p.description,
          p.Base_Price,
          p.image_url,
          p.created_at,

          i.id AS inventory_id,
          i.shop_id,
          i.stock_quantity,
          i.selling_price,
          i.unit,

          s.name AS shop_name
        FROM dukaan.Products p
        INNER JOIN dukaan.Inventory i 
          ON p.product_id = i.product_id AND i.is_deleted = 0
        INNER JOIN dukaan.Shops s 
          ON i.shop_id = s.shop_id
        WHERE ${whereClause}
        ${searchCondition}
        ORDER BY p.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

      return {
        products: productsResult.recordset,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Database error in findByOwner:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                    SOFT DELETE PRODUCT                                     */
  /* -------------------------------------------------------------------------- */

  async softDelete(productId) {
    try {
      const pool = await poolPromise;
      
      // We need to soft delete both the Product and the Inventory entries
      const transaction = new sql.Transaction(pool);
      await transaction.begin();

      try {
        const request = new sql.Request(transaction);
        request.input('productId', sql.Int, productId);

        // 1. Soft delete Inventory
        await request.query(`
          UPDATE dukaan.Inventory
          SET is_deleted = 1, deleted_at = GETDATE()
          WHERE product_id = @productId
        `);

        // 2. Soft delete Product
        const result = await request.query(`
          UPDATE dukaan.Products
          SET is_deleted = 1, deleted_at = GETDATE()
          OUTPUT INSERTED.product_id
          WHERE product_id = @productId
        `);

        await transaction.commit();
        return result.recordset.length > 0;

      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Database error in softDelete:', error);
      throw new Error(error.message);
    }
  }

}
