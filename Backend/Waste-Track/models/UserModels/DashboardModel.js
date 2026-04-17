import pool from '../../config/db.js';

class DashboardModel {
  // Monthly summary
  static async getMonthlySummary(userEmail) {
    const query = `
      SELECT year, month, collected_count, reported_count
      FROM dashboard_summary
      WHERE useremail = $1
      ORDER BY year DESC, month DESC
      LIMIT 6
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows.reverse();
  }

  // Total collected quantity
  static async getTotalCollectedQuantity(userEmail) {
    const query = `SELECT COALESCE(SUM(quantity), 0) as total FROM collect_waste WHERE useremail = $1`;
    const result = await pool.query(query, [userEmail]);
    return parseFloat(result.rows[0].total);
  }

  // Total reports
  static async getTotalReports(userEmail) {
    const query = `SELECT COUNT(*) as total FROM report_waste WHERE useremail = $1`;
    const result = await pool.query(query, [userEmail]);
    return parseInt(result.rows[0].total);
  }

  // Collected by category (bar chart)
  static async getCollectedByCategory(userEmail) {
    const query = `
      SELECT category, COALESCE(SUM(quantity), 0) as total_quantity
      FROM collect_waste
      WHERE useremail = $1
      GROUP BY category
      ORDER BY total_quantity DESC
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows;
  }

  // Reported by category (pie chart) – ito ang pinakamahalaga
  static async getReportedByCategory(userEmail) {
    const query = `
      SELECT category, COUNT(*) as count
      FROM report_waste
      WHERE useremail = $1
      GROUP BY category
      ORDER BY count DESC
    `;
    const result = await pool.query(query, [userEmail]);
    console.log('Reports by category result:', result.rows); // Debug log
    return result.rows;
  }

  // Recent 5 collections (camelCase para sa frontend)
  static async getRecentCollections(userEmail) {
    const query = `
      SELECT id, wastename, quantity, unit, datecollected, photourl
      FROM collect_waste
      WHERE useremail = $1
      ORDER BY datecollected DESC
      LIMIT 5
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows.map(row => ({
      id: row.id,
      wasteName: row.wastename,
      quantity: row.quantity,
      unit: row.unit,
      dateCollected: row.datecollected,
      photoUrl: row.photourl
    }));
  }

  // Recent 5 reports (camelCase)
  static async getRecentReports(userEmail) {
    const query = `
      SELECT id, wastename, category, location, datereported, photourl
      FROM report_waste
      WHERE useremail = $1
      ORDER BY datereported DESC
      LIMIT 5
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows.map(row => ({
      id: row.id,
      wasteName: row.wastename,
      category: row.category,
      location: row.location,
      dateReported: row.datereported,
      photoUrl: row.photourl
    }));
  }
}

export default DashboardModel;