import { poolPromise } from '../config/db.config.js';
import sql from 'mssql';

export class UserRepository {

  // ✅ CREATE USER
  async createUser(userData) {
    try {
      const { name, email, password_hash, phone_number, role } = userData;
      const pool = await poolPromise;

      const result = await pool.request()
        .input('name', sql.NVarChar(255), name)
        .input('email', sql.NVarChar(255), email)
        .input('password_hash', sql.NVarChar(255), password_hash)
        .input('phone_number', sql.NVarChar(15), phone_number)
        .input('role', sql.NVarChar(50), role || 'user')
        .input('is_deleted', sql.Bit, 0)
        .query(`
          INSERT INTO Users 
          (name, email, password_hash, phone_number, role, is_deleted, deleted_at)
          OUTPUT INSERTED.user_id, INSERTED.name, INSERTED.email,
                 INSERTED.phone_number, INSERTED.role,
                 INSERTED.image_url, INSERTED.created_at
          VALUES 
          (@name, @email, @password_hash, @phone_number, @role, @is_deleted, NULL)
        `);

      return result.recordset[0];

    } catch (error) {
      console.error('Database error in createUser:', error);

      if (error.number === 2627) {
        throw new Error('User with this email already exists');
      }

      throw new Error(`Database operation failed: ${error.message}`);
    }
  }


  // ✅ FIND BY EMAIL (FIXED)
  async findByEmail(email) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('email', sql.NVarChar(255), email)
        .query(`
          SELECT user_id, name, email, password_hash,
                 phone_number, role, image_url,
                 created_at
          FROM Users
          WHERE email = @email AND is_deleted = 0
        `);

      return result.recordset[0] || null;

    } catch (error) {
      console.error('Database error in findByEmail:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }


  // ✅ FIND BY ID (already mostly correct)
  async findById(userId) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .query(`
          SELECT user_id, name, email,
                 phone_number, role, image_url,
                 created_at
          FROM Users
          WHERE user_id = @userId AND is_deleted = 0
        `);

      return result.recordset[0] || null;

    } catch (error) {
      console.error('Database error in findById:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }


  // ✅ UPDATE IMAGE (FIXED)
  async updateImageUrl(userId, imageUrl) {
    try {
      const pool = await poolPromise;

      const result = await pool.request()
        .input('userId', sql.Int, userId)
        .input('imageUrl', sql.NVarChar(500), imageUrl)
        .query(`
          UPDATE Users
          SET image_url = @imageUrl
          WHERE user_id = @userId AND is_deleted = 0
        `);

      return result.rowsAffected[0] > 0;

    } catch (error) {
      console.error('Database error in updateImageUrl:', error);
      throw new Error(`Database operation failed: ${error.message}`);
    }
  }


  // ✅ UPDATE PROFILE (FIXED for your table)
async updateUserProfile(userId, data) {
  try {
    const pool = await poolPromise;

    // Build dynamic query
    let updateFields = `name = @name, phone_number = @phone_number`;
    if (data.image_url) {
      updateFields += `, image_url = @image_url`;
    }

    const request = pool.request()
      .input('userId', sql.Int, userId)
      .input('name', sql.NVarChar(255), data.name)
      .input('phone_number', sql.NVarChar(15), data.phone_number || null);

    if (data.image_url) {
      request.input('image_url', sql.NVarChar(500), data.image_url);
    }

    const query = `
      UPDATE Users
      SET ${updateFields}
      OUTPUT INSERTED.user_id,
             INSERTED.name,
             INSERTED.email,
             INSERTED.phone_number,
             INSERTED.image_url,
             INSERTED.created_at
      WHERE user_id = @userId
      AND is_deleted = 0
    `;

    const result = await request.query(query);

    return result.recordset[0] || null;

  } catch (error) {
    console.error("DB error in updateUserProfile:", error);
    throw new Error("Failed to update user profile");
  }
}


}
