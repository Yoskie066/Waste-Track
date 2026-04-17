import { Router } from 'express';
import UserController from '../../controllers/UserController/UserController.js';
import CollectWasteController from '../../controllers/UserController/CollectWasteController.js';
import ReportWasteController from '../../controllers/UserController/ReportWasteController.js';
import verifyToken from '../../middleware/verifyToken.js';
import upload from '../../middleware/multer.js';

const router = Router();

// User Login routes
router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/refresh-token', UserController.refreshToken);

// Collect waste routes
router.post('/collect-waste', verifyToken, upload.single('image'), CollectWasteController.addCollectWaste);
router.put('/collect-waste/:id', verifyToken, upload.single('image'), CollectWasteController.updateCollectWaste);
router.delete('/collect-waste/:id', verifyToken, CollectWasteController.deleteCollectWaste);
router.get('/collections', verifyToken, CollectWasteController.getUserCollectWastes);
router.get('/collect-waste/:id', verifyToken, CollectWasteController.getCollectWasteById);

// Report waste routes
router.post('/report-waste', verifyToken, upload.single('image'), ReportWasteController.addReport);
router.put('/report-waste/:id', verifyToken, upload.single('image'), ReportWasteController.updateReport);
router.delete('/report-waste/:id', verifyToken, ReportWasteController.deleteReport);
router.get('/reports', verifyToken, ReportWasteController.getUserReports);
router.get('/report-waste/:id', verifyToken, ReportWasteController.getReportById);





export default router;