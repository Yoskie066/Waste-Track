// backend/controllers/AdminController/AdminController.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../config/db.js';
import AdminModel from '../../models/AdminModels/AdminModel.js';

const ACCESS_TOKEN_SECRET = process.env.ADMIN_ACCESS_TOKEN_SECRET || 'admin_access_secret';
const REFRESH_TOKEN_SECRET = process.env.ADMIN_REFRESH_TOKEN_SECRET || 'admin_refresh_secret';

function generateAccessToken(admin) {
  return jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}

function generateRefreshToken(admin) {
  return jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, REFRESH_TOKEN_SECRET, { expiresIn: '25y' });
}

class AdminController {
  static async register(req, res) {
    const { email, password } = req.body;
    try {
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
      if (password.length < 4) return res.status(400).json({ error: 'Password must be at least 4 characters long' });

      const result = await AdminModel.register(email, password);
      if (result.error) return res.status(400).json({ error: result.error, details: result.details || '' });

      res.status(201).json({ message: 'Admin registered successfully', adminId: result.admin.id });
    } catch (err) {
      res.status(500).json({ error: 'Server error during registration', details: err.message });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;
    try {
      const client = await pool.connect();
      let userExists = false;
      try {
        const userCheck = await client.query(
          'SELECT id FROM "Users-Login" WHERE email = $1',
          [email.toLowerCase().trim()]
        );
        userExists = userCheck.rows.length > 0;
      } finally {
        client.release();
      }

      if (userExists) {
        return res.status(401).json({ error: 'This email is registered as user. Please login from User Portal.' });
      }

      const admin = await AdminModel.findByEmail(email);
      if (!admin) return res.status(401).json({ error: 'Invalid credentials' });

      const isMatch = await bcrypt.compare(password, admin.password);
      if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

      const accessToken = generateAccessToken(admin);
      const refreshToken = generateRefreshToken(admin);

      const dbClient = await pool.connect();
      try {
        await dbClient.query(
          `INSERT INTO admin_refresh_tokens (token, admin_id) VALUES ($1, $2)`,
          [refreshToken, admin.id]
        );
      } finally {
        dbClient.release();
      }

      res.status(200).json({
        message: 'Admin login successful',
        accessToken,
        refreshToken,
        user: {
          id: admin.id,
          email: admin.email,
          avatar_url: admin.avatar_url
        }
      });
    } catch (err) {
      console.error("DB Insert Error:", err);
      res.status(500).json({ error: 'Server error during login', details: err.message });
    }
  }

  static async forgotPassword(req, res) {
    const { email, newPassword } = req.body;
    try {
      if (!newPassword || newPassword.length < 4) {
        return res.status(400).json({ error: 'New password must be at least 4 characters long' });
      }

      const admin = await AdminModel.findByEmail(email);
      if (!admin) return res.status(404).json({ error: 'Email not found' });

      const isSamePassword = await bcrypt.compare(newPassword, admin.password);
      if (isSamePassword) return res.status(400).json({ error: 'New password cannot be the same as old password' });

      const updateResult = await AdminModel.updatePassword(email, newPassword);
      if (updateResult.error) return res.status(400).json({ error: updateResult.error });

      res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
      res.status(500).json({ error: 'Server error during password reset' });
    }
  }

  static async refreshToken(req, res) {
    const { token } = req.body;
    if (!token) return res.status(401).json({ error: 'Refresh token required' });

    try {
      const client = await pool.connect();
      const result = await client.query(
        `SELECT * FROM admin_refresh_tokens WHERE token = $1`,
        [token]
      );
      client.release();

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'Invalid or revoked refresh token' });
      }

      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
      const accessToken = generateAccessToken(decoded);
      res.status(200).json({ accessToken });
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }
  }

  static async profile(req, res) {
    try {
      const admin = await AdminModel.findByEmail(req.user.email);
      if (!admin) return res.status(404).json({ error: "Admin not found" });
      res.status(200).json({
        id: admin.id,
        email: admin.email,
        created_at: admin.created_at,
        avatar_url: admin.avatar_url
      });
    } catch (err) {
      console.error("Profile Error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }

  static async googleCallback(req, res) {
    try {
      const admin = req.user;
      if (!admin) {
        return res.redirect(`${process.env.FRONTEND_URL}/admin-login?error=no_admin`);
      }

      const accessToken = generateAccessToken(admin);
      const refreshToken = generateRefreshToken(admin);

      const client = await pool.connect();
      await client.query(
        `INSERT INTO admin_refresh_tokens (token, admin_id) VALUES ($1, $2)`,
        [refreshToken, admin.id]
      );
      client.release();

      const redirectUrl = `${process.env.FRONTEND_URL}/oauth-redirect?accessToken=${accessToken}&refreshToken=${refreshToken}&role=admin&email=${encodeURIComponent(admin.email)}&avatar=${encodeURIComponent(admin.avatar_url || '')}`;
      console.log('Redirecting admin to:', redirectUrl);
      res.redirect(redirectUrl);
    } catch (err) {
      console.error('Admin Google callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}/admin-login?error=google_auth_failed`);
    }
  }
}

export default AdminController;