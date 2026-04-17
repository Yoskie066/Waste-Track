// backend/config/passport.js
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import UserModel from '../models/UserModels/UserModel.js';
import AdminModel from '../models/AdminModels/AdminModel.js';
import dotenv from 'dotenv';
dotenv.config();

const generateRandomPassword = async () => {
  return await bcrypt.hash(Math.random().toString(36).slice(-8), 10);
};

// ---------- USER Strategy ----------
passport.use(
  'google-user',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL_USER,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const avatarUrl = profile.photos?.[0]?.value || null;

        let user = await UserModel.findByEmail(email);
        if (!user) {
          const randomPassword = await generateRandomPassword();
          const result = await UserModel.registerWithGoogle(email, randomPassword, googleId, avatarUrl);
          if (result.error) return done(result.error, null);
          user = result.user;
        } else {
          // Update google_id and avatar_url if needed
          let needsUpdate = false;
          if (!user.google_id) {
            needsUpdate = true;
          }
          if (avatarUrl && user.avatar_url !== avatarUrl) {
            needsUpdate = true;
          }
          if (needsUpdate) {
            await UserModel.updateGoogleIdAndAvatar(email, googleId, avatarUrl);
            // Refresh user data to get updated avatar_url
            user = await UserModel.findByEmail(email);
          }
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ---------- ADMIN Strategy ----------
passport.use(
  'google-admin',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL_ADMIN,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const avatarUrl = profile.photos?.[0]?.value || null;

        let admin = await AdminModel.findByEmail(email);
        if (!admin) {
          const randomPassword = await generateRandomPassword();
          const result = await AdminModel.registerWithGoogle(email, randomPassword, googleId, avatarUrl);
          if (result.error) return done(result.error, null);
          admin = result.admin;
        } else {
          let needsUpdate = false;
          if (!admin.google_id) needsUpdate = true;
          if (avatarUrl && admin.avatar_url !== avatarUrl) needsUpdate = true;
          if (needsUpdate) {
            await AdminModel.updateGoogleIdAndAvatar(email, googleId, avatarUrl);
            admin = await AdminModel.findByEmail(email);
          }
        }
        return done(null, admin);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;