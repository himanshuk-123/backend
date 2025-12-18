import { poolPromise } from '../config/db.config.js';
import sql from 'mssql';

export class ProductRepository {

  /* -------------------------------------------------------------------------- */
  /*                               HELPERS                                      */
  /* -------------------------------------------------------------------------- */

  _paginate(page = 1, limit = 20) {
    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(100, Math.max(1, Number(limit)));
    const offset = (safePage - 1) * safeLimit;
    return { safePage, safeLimit, offset };
  }

  /* -------------------------------------------------------------------------- */
  /*                         FIND ALL PRODUCTS                                   */
  /* -------------------------------------------------------------------------- */

  async findAll({ page = 1, limit = 20, search = '', shop_id = null } = {}) {
    try {
      const { safePage, safeLimit, offset } = this._paginate(page, limit);
      const pool = await poolPromise;

      const where = [
        'p.is_deleted = 0',
        'i.is_deleted = 0',
        's.is_deleted = 0',
        's.is_active = 1'
      ];

      if (shop_id) where.push('i.shop_id = @shop_id');

      const searchClause = search
        ? 'AND (p.name LIKE @search OR p.description LIKE @search)'
        : '';

      const whereClause = where.join(' AND ');

      /* ------------------------------- COUNT -------------------------------- */

      const countReq = pool.request();
      if (shop_id) countReq.input('shop_id', sql.Int, shop_id);
      if (search) countReq.input('search', sql.NVarChar, `%${search}%`);

      const countResult = await countReq.query(`
        SELECT COUNT(DISTINCT p.product_id) AS total
        FROM Products p
        INNER JOIN Inventory i ON p.product_id = i.product_id
        INNER JOIN Shops s ON i.shop_id = s.shop_id
        WHERE ${whereClause}
        ${searchClause}
      `);

      const total = countResult.recordset[0]?.total || 0;

      /* -------------------------------- DATA -------------------------------- */

      const dataReq = pool.request()
        .input('offset', sql.Int, offset)
        .input('limit', sql.Int, safeLimit);

      if (shop_id) dataReq.input('shop_id', sql.Int, shop_id);
      if (search) dataReq.input('search', sql.NVarChar, `%${search}%`);

      const result = await dataReq.query(`
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
        FROM Products p
        INNER JOIN Inventory i ON p.product_id = i.product_id
        INNER JOIN Shops s ON i.shop_id = s.shop_id
        WHERE ${whereClause}
        ${searchClause}
        ORDER BY p.created_at DESC
        OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
      `);

      return {
        products: result.recordset,
        pagination: {
          total,
          page: safePage,
          limit: safeLimit,
          totalPages: Math.ceil(total / safeLimit)
        }
      };

    } catch (error) {
      console.error('findAll error:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                            FIND BY ID                                      */
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
              i.unit,

              s.name AS shop_name
            FROM Products p
            LEFT JOIN Inventory i
              ON p.product_id = i.product_id
              AND i.shop_id = @shopId
              AND i.is_deleted = 0
            LEFT JOIN Shops s ON i.shop_id = s.shop_id
            WHERE p.product_id = @productId
              AND p.is_deleted = 0
              AND (s.is_deleted = 0 OR s.shop_id IS NULL)
          `);

        return result.recordset[0] || null;
      }

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
          FROM Products
          WHERE product_id = @productId
            AND is_deleted = 0
        `);

      return result.recordset[0] || null;

    } catch (error) {
      console.error('findById error:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               CREATE                                       */
  /* -------------------------------------------------------------------------- */

  async create({ name, description, Base_Price, image_url = null }) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('name', sql.NVarChar(255), name)
        .input('description', sql.NVarChar(sql.MAX), description || null)
        .input('Base_Price', sql.Decimal(10, 2), Base_Price)
        .input('image_url', sql.NVarChar(500), image_url)
        .query(`
          INSERT INTO Products (name, description, Base_Price, image_url)
          OUTPUT INSERTED.*
          VALUES (@name, @description, @Base_Price, @image_url)
        `);

      return result.recordset[0];

    } catch (error) {
      console.error('create product error:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                               UPDATE                                       */
  /* -------------------------------------------------------------------------- */

  async update(productId, data) {
    try {
      const pool = await poolPromise;
      const updates = [];
      const req = pool.request().input('productId', sql.Int, productId);

      if (data.name !== undefined) {
        req.input('name', sql.NVarChar(255), data.name);
        updates.push('name = @name');
      }

      if (data.description !== undefined) {
        req.input('description', sql.NVarChar(sql.MAX), data.description);
        updates.push('description = @description');
      }

      if (data.Base_Price !== undefined) {
        req.input('Base_Price', sql.Decimal(10, 2), data.Base_Price);
        updates.push('Base_Price = @Base_Price');
      }

      if (!updates.length) throw new Error('No fields to update');

      const result = await req.query(`
        UPDATE Products
        SET ${updates.join(', ')}
        OUTPUT INSERTED.*
        WHERE product_id = @productId
          AND is_deleted = 0
      `);

      return result.recordset[0] || null;

    } catch (error) {
      console.error('update product error:', error);
      throw new Error(error.message);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                           ADD TO INVENTORY                                  */
  /* -------------------------------------------------------------------------- */

  async addToInventory(shopId, productId, { stock_quantity, selling_price, unit }) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('shopId', sql.Int, shopId)
        .input('productId', sql.Int, productId)
        .input('stock_quantity', sql.Int, stock_quantity)
        .input('selling_price', sql.Decimal(10, 2), selling_price)
        .input('unit', sql.NVarChar(50), unit)
        .query(`
          INSERT INTO Inventory
            (shop_id, product_id, stock_quantity, selling_price, unit, is_deleted)
          OUTPUT INSERTED.*
          VALUES
            (@shopId, @productId, @stock_quantity, @selling_price, @unit, 0)
        `);

      return result.recordset[0];

    } catch (error) {
      if (error.number === 2627) {
        throw new Error('Product already exists in inventory');
      }
      throw error;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                           CHECK AVAILABILITY                                */
  /* -------------------------------------------------------------------------- */

  async checkAvailability(productId, shopId) {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('productId', sql.Int, productId)
      .input('shopId', sql.Int, shopId)
      .query(`
        SELECT i.stock_quantity, i.is_deleted
        FROM Inventory i
        INNER JOIN Products p ON p.product_id = i.product_id
        INNER JOIN Shops s ON s.shop_id = i.shop_id
        WHERE p.product_id = @productId
          AND i.shop_id = @shopId
          AND p.is_deleted = 0
          AND i.is_deleted = 0
          AND s.is_active = 1
          AND s.is_deleted = 0
      `);

    const row = result.recordset[0];
    if (!row) return null;

    return {
      exists: true,
      available: row.stock_quantity > 0,
      stock_quantity: row.stock_quantity
    };
  }

  /* -------------------------------------------------------------------------- */
  /*                             SOFT DELETE                                    */
  /* -------------------------------------------------------------------------- */

  async softDelete(productId) {
    const pool = await poolPromise;
    const tx = new sql.Transaction(pool);

    await tx.begin();

    try {
      const req = new sql.Request(tx);
      req.input('productId', sql.Int, productId);

      await req.query(`
        UPDATE Inventory
        SET is_deleted = 1, deleted_at = GETDATE()
        WHERE product_id = @productId
          AND is_deleted = 0
      `);

      const result = await req.query(`
        UPDATE Products
        SET is_deleted = 1, deleted_at = GETDATE()
        OUTPUT INSERTED.product_id
        WHERE product_id = @productId
          AND is_deleted = 0
      `);

      await tx.commit();
      return result.recordset.length > 0;

    } catch (err) {
      await tx.rollback();
      throw err;
    }
  }
}
