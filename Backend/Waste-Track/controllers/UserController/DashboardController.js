import DashboardModel from '../../models/UserModels/DashboardModel.js';
import pool from '../../config/db.js';

class DashboardController {
  static async getDashboardData(req, res) {
    try {
      const userEmail = req.user.email;
      if (!userEmail) {
        return res.status(401).json({ success: false, message: 'User email not found' });
      }

      // Kunin ang user info (email at avatar)
      const userQuery = await pool.query(
        `SELECT id, email, avatar_url FROM "Users-Login" WHERE email = $1`,
        [userEmail]
      );
      const user = userQuery.rows[0] || { email: userEmail, avatar_url: null };

      // Sabay-sabay na kunin ang lahat ng data
      const [
        monthlySummary,
        totalCollected,
        totalReports,
        collectedByCategory,
        reportedByCategory,
        recentCollections,
        recentReports,
      ] = await Promise.all([
        DashboardModel.getMonthlySummary(userEmail),
        DashboardModel.getTotalCollectedQuantity(userEmail),
        DashboardModel.getTotalReports(userEmail),
        DashboardModel.getCollectedByCategory(userEmail),
        DashboardModel.getReportedByCategory(userEmail),
        DashboardModel.getRecentCollections(userEmail),
        DashboardModel.getRecentReports(userEmail),
      ]);

      res.json({
        success: true,
        data: {
          user: {
            email: user.email,
            avatar: user.avatar_url,
          },
          totals: {
            totalCollectedQuantity: totalCollected,
            totalReports,
          },
          monthlySummary,
          collectedByCategory,
          reportedByCategory,
          recentCollections,
          recentReports,
        },
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({ success: false, message: 'Failed to load dashboard data', error: error.message });
    }
  }
}

export default DashboardController;