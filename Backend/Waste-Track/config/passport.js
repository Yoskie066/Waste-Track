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

        let user = await UserModel.findByEmail(email);
        if (!user) {
          const randomPassword = await generateRandomPassword();
          const result = await UserModel.registerWithGoogle(email, randomPassword, googleId);
          if (result.error) return done(result.error, null);
          user = result.user;
        } else {
          if (!user.google_id) {
            await UserModel.updateGoogleId(email, googleId);
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

        let admin = await AdminModel.findByEmail(email);
        if (!admin) {
          const randomPassword = await generateRandomPassword();
          const result = await AdminModel.registerWithGoogle(email, randomPassword, googleId);
          if (result.error) return done(result.error, null);
          admin = result.admin;
        } else {
          if (!admin.google_id) {
            await AdminModel.updateGoogleId(email, googleId);
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