import { poolPromise } from '../config/db.config.js';
import sql from 'mssql';

export class UserAddressRepository {

  // Get all addresses of a user (excluding deleted)
  async getUserAddresses(userId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT 
            address_id,
            user_id,
            full_name,
            phone,
            house,
            landmark,
            city,
            state,
            pincode,
            is_default,
            created_at
          FROM UserAddresses
          WHERE user_id = @userId AND is_deleted = 0
          ORDER BY is_default DESC, created_at DESC
        `);

      return result.recordset;

    } catch (error) {
      console.error('Database error in getUserAddresses:', error);
      throw new Error('Failed to fetch addresses');
    }
  }


  // Get default address of user
  async getDefaultAddress(userId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT TOP 1 *
          FROM UserAddresses
          WHERE user_id = @userId 
            AND is_deleted = 0 
            AND is_default = 1
        `);

      return result.recordset[0] || null;

    } catch (error) {
      console.error('Database error in getDefaultAddress:', error);
      throw new Error('Failed to fetch default address');
    }
  }


  // Add new address
  async createAddress(userId, addressData) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('user_id', sql.Int, userId)
        .input('full_name', sql.NVarChar, addressData.full_name)
        .input('phone', sql.NVarChar, addressData.phone)
        .input('house', sql.NVarChar, addressData.house)
        .input('landmark', sql.NVarChar, addressData.landmark || null)
        .input('city', sql.NVarChar, addressData.city)
        .input('state', sql.NVarChar, addressData.state)
        .input('pincode', sql.NVarChar, addressData.pincode)
        .input('is_default', sql.Bit, addressData.is_default ?? 0)
        .query(`
          INSERT INTO UserAddresses
          (user_id, full_name, phone, house, landmark, city, state, pincode, is_default)
          OUTPUT INSERTED.*
          VALUES
          (@user_id, @full_name, @phone, @house, @landmark, @city, @state, @pincode, @is_default)
        `);

      return result.recordset[0];

    } catch (error) {
      console.error('Database error in createAddress:', error);
      throw new Error('Failed to create address');
    }
  }


  // Remove default from all addresses of a user
  async removeAllDefaults(userId) {
    try {
      const pool = await poolPromise;

      await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          UPDATE UserAddresses
          SET is_default = 0
          WHERE user_id = @userId AND is_deleted = 0
        `);

      return true;

    } catch (error) {
      console.error('Database error in removeAllDefaults:', error);
      throw new Error('Failed to reset default address');
    }
  }


  // Set a specific address as default
  async setDefaultAddress(userId, addressId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('addressId', sql.Int, addressId)
        .query(`
          UPDATE UserAddresses
          SET is_default = 1
          WHERE address_id = @addressId 
            AND user_id = @userId
            AND is_deleted = 0
        `);

      return result.rowsAffected[0] > 0;

    } catch (error) {
      console.error('Database error in setDefaultAddress:', error);
      throw new Error('Failed to set default address');
    }
  }


  // Soft delete address
  async deleteAddress(userId, addressId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('addressId', sql.Int, addressId)
        .query(`
          UPDATE UserAddresses
          SET is_deleted = 1,
              deleted_at = GETDATE()
          WHERE address_id = @addressId
            AND user_id = @userId
        `);

      return result.rowsAffected[0] > 0;

    } catch (error) {
      console.error('Database error in deleteAddress:', error);
      throw new Error('Failed to delete address');
    }
  }

}
