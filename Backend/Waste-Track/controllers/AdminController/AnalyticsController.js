import AnalyticsModel from '../../models/AdminModels/AnalyticsModel.js';

class AnalyticsController {
  static async getDashboardOverview(req, res) {
    try {
      const data = await AnalyticsModel.getDashboardOverview();
      res.json({
        success: true,
        data
      });
    } catch (error) {
      console.error('Error in getDashboardOverview:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch analytics data', error: error.message });
    }
  }

  static async getUserAdminStats(req, res) {
    try {
      const data = await AnalyticsModel.getUserAdminStats();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getUserAdminStats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch user/admin stats', error: error.message });
    }
  }

  static async getCollectedWasteStats(req, res) {
    try {
      const data = await AnalyticsModel.getCollectedWasteStats();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getCollectedWasteStats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch collected waste stats', error: error.message });
    }
  }

  static async getReportedWasteStats(req, res) {
    try {
      const data = await AnalyticsModel.getReportedWasteStats();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error in getReportedWasteStats:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch reported waste stats', error: error.message });
    }
  }
}

export default AnalyticsController;