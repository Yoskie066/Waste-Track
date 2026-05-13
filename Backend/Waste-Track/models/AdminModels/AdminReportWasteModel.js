import pool from '../../config/db.js';

class AdminReportWasteModel {
  static async getAllReports({
    page, limit, search, wasteName, category, subCategory,
    color, location, dateFrom, dateTo,
    sortBy = 'datereported', sortOrder = 'DESC'
  }) {
    const offset = (page - 1) * limit;
    let baseQuery = `SELECT * FROM report_waste`;
    const countQuery = `SELECT COUNT(*) as total FROM report_waste`;
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`(wastename ILIKE $${values.length + 1} OR description ILIKE $${values.length + 1} OR location ILIKE $${values.length + 1})`);
      values.push(`%${search}%`);
    }
    if (wasteName) {
      conditions.push(`wastename ILIKE $${values.length + 1}`);
      values.push(`%${wasteName}%`);
    }
    if (category) {
      conditions.push(`category = $${values.length + 1}`);
      values.push(category);
    }
    if (subCategory) {
      conditions.push(`subcategory = $${values.length + 1}`);
      values.push(subCategory);
    }
    if (color && color !== 'all') {
      conditions.push(`color = $${values.length + 1}`);
      values.push(color);
    }
    if (location && location !== 'all') {
      conditions.push(`location = $${values.length + 1}`);
      values.push(location);
    }
    if (dateFrom) {
      conditions.push(`datereported >= $${values.length + 1}`);
      values.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`datereported <= $${values.length + 1}`);
      values.push(dateTo);
    }

    if (conditions.length) {
      const whereClause = ` WHERE ` + conditions.join(' AND ');
      baseQuery += whereClause;
    }

    const allowedSortColumns = ['datereported', 'wastename', 'category', 'location'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'datereported';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    baseQuery += ` ORDER BY "${sortColumn}" ${order}`;

    baseQuery += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    try {
      const dataResult = await pool.query(baseQuery, values);
      const countResult = await pool.query(
        countQuery + (conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''),
        values.slice(0, conditions.length)
      );

      const data = dataResult.rows.map(row => ({
        id: row.id,
        wastename: row.wastename,
        category: row.category,
        subcategory: row.subcategory,
        color: row.color,
        location: row.location,
        datereported: row.datereported,
        description: row.description,
        photourl: row.photourl,
        useremail: row.useremail
      }));

      return { data, total: parseInt(countResult.rows[0].total) };
    } catch (error) {
      console.error('SQL ERROR in getAllReports:', error.message);
      throw error;
    }
  }

  static async getDistinctColors() {
    const query = `SELECT DISTINCT color FROM report_waste WHERE color IS NOT NULL AND color != '' ORDER BY color`;
    try {
      const result = await pool.query(query);
      return result.rows.map(row => row.color);
    } catch (error) {
      console.error('SQL ERROR in getDistinctColors:', error.message);
      throw error;
    }
  }

  static async getDistinctLocations() {
    const query = `SELECT DISTINCT location FROM report_waste WHERE location IS NOT NULL AND location != '' ORDER BY location`;
    try {
      const result = await pool.query(query);
      return result.rows.map(row => row.location);
    } catch (error) {
      console.error('SQL ERROR in getDistinctLocations:', error.message);
      throw error;
    }
  }

  static async deleteReport(id) {
    const query = `DELETE FROM report_waste WHERE id = $1 RETURNING *`;
    try {
      const result = await pool.query(query, [id]);
      if (result.rows[0]) {
        const row = result.rows[0];
        return {
          id: row.id,
          wastename: row.wastename,
          category: row.category,
          subcategory: row.subcategory,
          color: row.color,
          location: row.location,
          datereported: row.datereported,
          description: row.description,
          photourl: row.photourl,
          useremail: row.useremail
        };
      }
      return null;
    } catch (error) {
      console.error('SQL ERROR in deleteReport:', error.message);
      throw error;
    }
  }
}

export default AdminReportWasteModel;