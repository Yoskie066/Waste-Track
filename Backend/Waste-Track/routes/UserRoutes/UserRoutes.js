import { Router } from 'express';
import UserController from '../../controllers/UserController/UserController.js';

const router = Router();

// POST routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/refresh-token', UserController.refreshToken);


export default router;