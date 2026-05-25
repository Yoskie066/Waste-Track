import pool from '../../config/db.js';

class AnalyticsModel {
  // ========== USER & ADMIN STATS ==========
  static async getUserAdminStats() {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM "Users-Login") as total_users,
        (SELECT COUNT(*) FROM "Admins-Login") as total_admins,
        (SELECT COUNT(*) FROM "Users-Login" u WHERE EXISTS (
          SELECT 1 FROM refresh_tokens rt WHERE rt.user_id = u.id AND rt.created_at > NOW() - INTERVAL '15 minutes'
        )) as online_users,
        (SELECT COUNT(*) FROM "Admins-Login" a WHERE EXISTS (
          SELECT 1 FROM admin_refresh_tokens art WHERE art.admin_id = a.id AND art.created_at > NOW() - INTERVAL '15 minutes'
        )) as online_admins
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }

  // ========== COLLECTED WASTE STATS ==========
  static async getCollectedWasteStats() {
    // Total collected waste records
    const totalQuery = `SELECT COUNT(*) as total_records, SUM(quantity) as total_quantity FROM collect_waste`;
    const totalResult = await pool.query(totalQuery);
    
    // By category
    const categoryQuery = `
      SELECT category, COUNT(*) as count, SUM(quantity) as total_quantity
      FROM collect_waste
      GROUP BY category
      ORDER BY count DESC
    `;
    const categoryResult = await pool.query(categoryQuery);
    
    // By month (last 12 months)
    const monthlyQuery = `
      SELECT 
        TO_CHAR(datecollected, 'Mon YYYY') as month,
        EXTRACT(MONTH FROM datecollected) as month_num,
        EXTRACT(YEAR FROM datecollected) as year,
        COUNT(*) as count,
        SUM(quantity) as total_quantity
      FROM collect_waste
      WHERE datecollected >= NOW() - INTERVAL '12 months'
      GROUP BY EXTRACT(YEAR FROM datecollected), EXTRACT(MONTH FROM datecollected), TO_CHAR(datecollected, 'Mon YYYY')
      ORDER BY year DESC, month_num DESC
      LIMIT 12
    `;
    const monthlyResult = await pool.query(monthlyQuery);
    
    // Top waste types
    const wasteTypeQuery = `
      SELECT wastename, COUNT(*) as count, SUM(quantity) as total_quantity
      FROM collect_waste
      GROUP BY wastename
      ORDER BY count DESC
      LIMIT 10
    `;
    const wasteTypeResult = await pool.query(wasteTypeQuery);
    
    return {
      total: {
        records: parseInt(totalResult.rows[0].total_records) || 0,
        quantity: parseFloat(totalResult.rows[0].total_quantity) || 0
      },
      byCategory: categoryResult.rows,
      byMonth: monthlyResult.rows,
      topWasteTypes: wasteTypeResult.rows
    };
  }

  // ========== REPORTED WASTE STATS ==========
  static async getReportedWasteStats() {
    // Total reported waste records
    const totalQuery = `SELECT COUNT(*) as total_records FROM report_waste`;
    const totalResult = await pool.query(totalQuery);
    
    // By category
    const categoryQuery = `
      SELECT category, COUNT(*) as count
      FROM report_waste
      GROUP BY category
      ORDER BY count DESC
    `;
    const categoryResult = await pool.query(categoryQuery);
    
    // By month (last 12 months)
    const monthlyQuery = `
      SELECT 
        TO_CHAR(datereported, 'Mon YYYY') as month,
        EXTRACT(MONTH FROM datereported) as month_num,
        EXTRACT(YEAR FROM datereported) as year,
        COUNT(*) as count
      FROM report_waste
      WHERE datereported >= NOW() - INTERVAL '12 months'
      GROUP BY EXTRACT(YEAR FROM datereported), EXTRACT(MONTH FROM datereported), TO_CHAR(datereported, 'Mon YYYY')
      ORDER BY year DESC, month_num DESC
      LIMIT 12
    `;
    const monthlyResult = await pool.query(monthlyQuery);
    
    // By color
    const colorQuery = `
      SELECT color, COUNT(*) as count
      FROM report_waste
      WHERE color IS NOT NULL AND color != ''
      GROUP BY color
      ORDER BY count DESC
      LIMIT 8
    `;
    const colorResult = await pool.query(colorQuery);
    
    // By location (top 10)
    const locationQuery = `
      SELECT location, COUNT(*) as count
      FROM report_waste
      WHERE location IS NOT NULL AND location != ''
      GROUP BY location
      ORDER BY count DESC
      LIMIT 10
    `;
    const locationResult = await pool.query(locationQuery);
    
    // Top waste types reported
    const wasteTypeQuery = `
      SELECT wastename, COUNT(*) as count
      FROM report_waste
      GROUP BY wastename
      ORDER BY count DESC
      LIMIT 10
    `;
    const wasteTypeResult = await pool.query(wasteTypeQuery);
    
    return {
      total: {
        records: parseInt(totalResult.rows[0].total_records) || 0
      },
      byCategory: categoryResult.rows,
      byMonth: monthlyResult.rows,
      byColor: colorResult.rows,
      byLocation: locationResult.rows,
      topWasteTypes: wasteTypeResult.rows
    };
  }

  // ========== COMBINED DASHBOARD OVERVIEW ==========
  static async getDashboardOverview() {
    const collected = await this.getCollectedWasteStats();
    const reported = await this.getReportedWasteStats();
    const userAdmin = await this.getUserAdminStats();
    
    return {
      userAdmin,
      collected,
      reported
    };
  }
}

export default AnalyticsModel;