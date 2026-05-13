import { Router } from 'express';
import AdminController from '../../controllers/AdminController/AdminController.js';
import AdminCollectWasteController from '../../controllers/AdminController/AdminCollectWasteController.js';
import AdminReportWasteController from '../../controllers/AdminController/AdminReportWasteController.js';
import verifyAdminToken from '../../middleware/verifyAdminToken.js';

const router = Router();

// Admin auth
router.post('/register', AdminController.register);
router.post('/login', AdminController.login);
router.post('/forgot-password', AdminController.forgotPassword);
router.post('/refresh-token', AdminController.refreshToken);

// Collected Waste
router.get('/collect-waste', verifyAdminToken, AdminCollectWasteController.getAllCollectWastes);
router.delete('/collect-waste/:id', verifyAdminToken, AdminCollectWasteController.deleteCollectWaste);
router.get('/collect-waste/export', verifyAdminToken, AdminCollectWasteController.exportCollectWastes);
router.get('/collect-waste/units', verifyAdminToken, AdminCollectWasteController.getUnits);  

// Reported Waste
router.get('/report-waste', verifyAdminToken, AdminReportWasteController.getAllReports);
router.delete('/report-waste/:id', verifyAdminToken, AdminReportWasteController.deleteReport);
router.get('/report-waste/export', verifyAdminToken, AdminReportWasteController.exportReports);
router.get('/report-waste/colors', verifyAdminToken, AdminReportWasteController.getColors);     
router.get('/report-waste/locations', verifyAdminToken, AdminReportWasteController.getLocations); 

export default router;