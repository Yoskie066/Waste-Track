import express from 'express';
import passport from '../../config/passport.js';
import UserController from '../../controllers/UserController/UserController.js';
import AdminController from '../../controllers/AdminController/AdminController.js';

const router = express.Router();

// User Google OAuth
router.get('/auth/google',
  passport.authenticate('google-user', { scope: ['profile', 'email'], session: false })
);

router.get('/auth/google/callback',
  passport.authenticate('google-user', { 
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`,
    session: false 
  }),
  UserController.googleCallback
);

// Admin Google OAuth
router.get('/auth/google/admin',
  passport.authenticate('google-admin', { scope: ['profile', 'email'], session: false })
);

router.get('/auth/google/admin/callback',
  passport.authenticate('google-admin', { 
    failureRedirect: `${process.env.FRONTEND_URL}/admin-login?error=google_failed`,
    session: false 
  }),
  AdminController.googleCallback
);

export default router;