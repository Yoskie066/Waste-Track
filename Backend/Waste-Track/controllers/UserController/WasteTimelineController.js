import WasteTimelineModel from '../../models/UserModels/WasteTimelineModel.js';

class WasteTimelineController {
  static async getTimeline(req, res) {
    try {
      const userEmail = req.user?.email;
      if (!userEmail) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const timeline = await WasteTimelineModel.getUserTimeline(userEmail);

      res.json({
        success: true,
        data: timeline,
      });
    } catch (error) {
      console.error('Error fetching timeline:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch timeline',
        error: error.message,
      });
    }
  }
}

export default WasteTimelineController;