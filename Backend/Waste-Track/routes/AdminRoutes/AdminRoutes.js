import { Router } from 'express';
import AdminController from '../../controllers/AdminController/AdminController.js';

const router = Router();

router.post('/register', AdminController.register);
router.post('/login', AdminController.login);
router.post('/forgot-password', AdminController.forgotPassword);
router.post('/refresh-token', AdminController.refreshToken);

export default router;