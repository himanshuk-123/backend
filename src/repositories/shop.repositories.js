import { poolPromise } from '../config/db.config.js';
import sql from 'mssql';

export class ShopRepository {
  /**
   * Create a new shop
   * @param {Object} shopData - Shop data
   * @returns {Object} Created shop
   */
  async create(shopData) {
    try {
      const { owner_id, name, description, cat_id, address, pincode, latitude, longitude } = shopData;
      const pool = await poolPromise;

      const result = await pool.request()
        .input('owner_id', sql.Int, owner_id)
        .input('name', sql.NVarChar(255), name)
        .input('description', sql.NVarChar(sql.MAX), description)
        .input('cat_id', sql.Int(100), cat_id)
        .input('address', sql.NVarChar(500), address)
        .input('pincode', sql.NVarChar(10), pincode)
        .input('latitude', sql.Decimal(10, 8), latitude || null)
        .input('longitude', sql.Decimal(11, 8), longitude || null)
        .query(`
          INSERT INTO dukaan.Shops (owner_id, name, description, cat_id, address, pincode, latitude, longitude, is_active)
          OUTPUT INSERTED.shop_id, INSERTED.owner_id, INSERTED.name, INSERTED.description, INSERTED.cat_id,
                 INSERTED.address, INSERTED.pincode, INSERTED.latitude, INSERTED.longitude, 
                 INSERTED.is_active, INSERTED.image_url, INSERTED.created_at
          VALUES (@owner_id, @name, @description, @cat_id, @address, @pincode, @latitude, @longitude, 1)
        `);

      return result.recordset[0];
    } catch (error) {
      console.error('Database error in create shop:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Find shop by ID
   * @param {number} shopId - Shop ID
   * @returns {Object|null} Shop data or null
   */
  async findById(shopId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          SELECT 
            s.shop_id,
            s.owner_id,
            s.name,
            s.description,
            s.address,
            s.pincode,
            s.latitude,
            s.longitude,
            s.is_active,
            s.is_deleted,
            s.image_url,
            s.created_at,
            u.name as owner_name,
            u.email as owner_email
          FROM dukaan.Shops s
          INNER JOIN dukaan.Users u ON s.owner_id = u.user_id
          WHERE s.shop_id = @shopId AND s.is_deleted = 0
        `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Database error in findById shop:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Find shops by owner ID
   * @param {number} ownerId - Owner (user) ID
   * @returns {Array} List of shops
   */
  async findByOwnerId(ownerId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('ownerId', sql.Int, ownerId)
        .query(`
          SELECT 
            shop_id,
            owner_id,
            name,
            description,
            address,
            pincode,
            latitude,
            longitude,
            is_active,
            is_deleted,
            image_url,
            created_at
          FROM dukaan.Shops
          WHERE owner_id = @ownerId AND is_deleted = 0
          ORDER BY created_at DESC
        `);

      return result.recordset;
    } catch (error) {
      console.error('Database error in findByOwnerId:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Find shops by category with pagination
   * @param {string} category - Category name
   * @param {Object} options - Pagination options
   * @returns {Object} Shops with pagination
   */
async findByCategory(cat_id, options = {}) {
  try {
    const { page = 1, limit = 20, search = '' } = options;
    const offset = (page - 1) * limit;
    const pool = await poolPromise;

    let searchCondition = '';
    if (search) {
      searchCondition = `AND (s.name LIKE @search OR s.description LIKE @search)`;
    }

    const countResult = await pool.request()
      .input('cat_id', sql.Int, parseInt(cat_id))
      .input('search', sql.NVarChar, `%${search}%`)
      .query(`
        SELECT COUNT(*) as total
        FROM dukaan.Shops s
        WHERE s.cat_id = @cat_id 
          AND s.is_deleted = 0 
          AND s.is_active = 1
          ${searchCondition}
      `);

    const total = countResult.recordset[0].total;

    const shopsResult = await pool.request()
      .input('cat_id', sql.Int, parseInt(cat_id))
      .input('search', sql.NVarChar, `%${search}%`)
      .input('limit', sql.Int, limit)
      .input('offset', sql.Int, offset)
      .query(`
        SELECT 
          s.shop_id,
          s.owner_id,
          s.name,
          s.description,
          s.address,
          s.pincode,
          s.latitude,
          s.longitude,
          s.is_active,
          s.image_url,
          s.created_at
        FROM dukaan.Shops s
        WHERE s.cat_id = @cat_id 
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
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error) {
    console.error('Database error in findByCategory:', error);
    throw new Error(`Database operation failed: ${error.message}`);
  }
}


  /**
   * Update shop
   * @param {number} shopId - Shop ID
   * @param {Object} shopData - Updated shop data
   * @returns {Object} Updated shop
   */
async update(shopId, shopData) {
  try {
    const { name, description, cat_id, address, pincode, latitude, longitude, is_active } = shopData;
    const pool = await poolPromise;

    const updates = [];
    const request = pool.request().input('shopId', sql.Int, shopId);

    if (name !== undefined) {
      updates.push('name = @name');
      request.input('name', sql.NVarChar(255), name);
    }

    if (description !== undefined) {
      updates.push('description = @description');
      request.input('description', sql.NVarChar(sql.MAX), description);
    }

    // ✅ FIX: category → cat_id
    if (cat_id !== undefined) {
      updates.push('cat_id = @cat_id');
      request.input('cat_id', sql.Int, cat_id);
    }

    if (address !== undefined) {
      updates.push('address = @address');
      request.input('address', sql.NVarChar(500), address);
    }

    if (pincode !== undefined) {
      updates.push('pincode = @pincode');
      request.input('pincode', sql.NVarChar(10), pincode);
    }

    if (latitude !== undefined) {
      updates.push('latitude = @latitude');
      request.input('latitude', sql.Decimal(10, 8), latitude);
    }

    if (longitude !== undefined) {
      updates.push('longitude = @longitude');
      request.input('longitude', sql.Decimal(11, 8), longitude);
    }

    if (is_active !== undefined) {
      updates.push('is_active = @is_active');
      request.input('is_active', sql.Bit, is_active);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    const result = await request.query(`
      UPDATE dukaan.Shops
      SET ${updates.join(', ')}
      OUTPUT 
        INSERTED.shop_id,
        INSERTED.owner_id,
        INSERTED.name,
        INSERTED.description,
        INSERTED.cat_id,        -- FIXED
        INSERTED.address,
        INSERTED.pincode,
        INSERTED.latitude,
        INSERTED.longitude,
        INSERTED.is_active,
        INSERTED.image_url,
        INSERTED.created_at
      WHERE shop_id = @shopId AND is_deleted = 0
    `);

    if (result.recordset.length === 0) {
      return null;
    }

    return result.recordset[0];

  } catch (error) {
    console.error('Database error in update shop:', error);
    throw new Error(`Database operation failed: ${error.message}`);
  }
}

  /**
   * Soft delete shop
   * @param {number} shopId - Shop ID
   * @returns {boolean} True if deleted
   */
  async softDelete(shopId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('shopId', sql.Int, shopId)
        .query(`
          UPDATE dukaan.Shops
          SET is_deleted = 1, deleted_at = GETDATE()
          WHERE shop_id = @shopId AND is_deleted = 0
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Database error in softDelete shop:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Update shop image URL
   * @param {number} shopId - Shop ID
   * @param {string} imageUrl - Image URL
   * @returns {boolean} True if updated
   */
  async updateImageUrl(shopId, imageUrl) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('shopId', sql.Int, shopId)
        .input('imageUrl', sql.NVarChar(500), imageUrl)
        .query(`
          UPDATE dukaan.Shops
          SET image_url = @imageUrl
          WHERE shop_id = @shopId
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Database error in updateImageUrl:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }

  /**
   * Check if shop belongs to owner
   * @param {number} shopId - Shop ID
   * @param {number} ownerId - Owner (user) ID
   * @returns {boolean} True if shop belongs to owner
   */
  async isOwner(shopId, ownerId) {
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input('shopId', sql.Int, shopId)
        .input('ownerId', sql.Int, ownerId)
        .query(`
          SELECT COUNT(*) as count
          FROM dukaan.Shops
          WHERE shop_id = @shopId AND owner_id = @ownerId AND is_deleted = 0
        `);

      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Database error in isOwner:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }
}

