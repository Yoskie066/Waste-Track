import pool from '../../config/db.js';
import bcrypt from 'bcryptjs';

class AdminModel {
  static async checkEmailNotUser(email) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT id FROM "Users-Login" WHERE email = $1',
        [email.toLowerCase().trim()]
      );
      return result.rows.length === 0;
    } finally {
      client.release();
    }
  }

  static async register(email, password) {
    if (!email || !password) return { error: 'Email and password are required' };
    if (password.length < 4) return { error: 'Password must be at least 4 characters long' };

    // 1. Check if email is already used by a user
    const isAvailableForAdmin = await this.checkEmailNotUser(email);
    if (!isAvailableForAdmin) {
      return { error: 'Email already registered as user. Cannot create an admin account.' };
    }

    const client = await pool.connect();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await client.query(
        `INSERT INTO "Admins-Login" (email, password)
         VALUES ($1, $2)
         RETURNING id, email, created_at`,
        [email.toLowerCase().trim(), hashedPassword]
      );
      return { success: true, admin: result.rows[0] };
    } catch (err) {
      if (err.code === '23505') return { error: 'Email already registered as admin' };
      return { error: 'Registration failed', details: err.message };
    } finally {
      client.release();
    }
  }

  static async findByEmail(email) {
    if (!email) throw new Error("Email is required in findByEmail");
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM "Admins-Login" WHERE email = $1',
        [email.toLowerCase().trim()]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  static async verifyPassword(email, password) {
    const admin = await this.findByEmail(email);
    if (!admin) return false;
    return bcrypt.compare(password, admin.password);
  }

  static async updatePassword(email, newPassword) {
    if (newPassword.length < 4) return { error: 'Password must be at least 4 characters long' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const client = await pool.connect();
    try {
      const result = await client.query(
        `UPDATE "Admins-Login"
         SET password = $1, updated_at = CURRENT_TIMESTAMP
         WHERE email = $2
         RETURNING email, updated_at`,
        [hashedPassword, email.toLowerCase().trim()]
      );
      if (result.rows.length === 0) return { error: 'Email not found' };
      return { success: true, message: 'Password updated', data: result.rows[0] };
    } finally {
      client.release();
    }
  }

  static async registerWithGoogle(email, hashedPassword, googleId) {
    if (!email) return { error: 'Email is required' };
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO "Admins-Login" (email, password, google_id)
         VALUES ($1, $2, $3)
         RETURNING id, email, created_at, google_id`,
        [email.toLowerCase().trim(), hashedPassword, googleId]
      );
      return { success: true, admin: result.rows[0] };
    } catch (err) {
      if (err.code === '23505') return { error: 'Email already registered as admin' };
      return { error: 'Google admin registration failed', details: err.message };
    } finally {
      client.release();
    }
  }

  static async updateGoogleId(email, googleId) {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE "Admins-Login" SET google_id = $1 WHERE email = $2`,
        [googleId, email.toLowerCase().trim()]
      );
    } finally {
      client.release();
    }
  }
}

export default AdminModel;