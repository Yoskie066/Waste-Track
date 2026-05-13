import pool from '../../config/db.js';

class AdminCollectWasteModel {
  static async getAllCollectWastes({
    page, limit, search, wasteName, category, subCategory,
    unit, dateFrom, dateTo,
    sortBy = 'datecollected', sortOrder = 'DESC'
  }) {
    const offset = (page - 1) * limit;
    let baseQuery = `SELECT * FROM collect_waste`;
    const countQuery = `SELECT COUNT(*) as total FROM collect_waste`;
    const conditions = [];
    const values = [];

    if (search) {
      conditions.push(`(wastename ILIKE $${values.length + 1} OR description ILIKE $${values.length + 1})`);
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
    if (unit && unit !== 'all') {
      conditions.push(`unit = $${values.length + 1}`);
      values.push(unit);
    }
    if (dateFrom) {
      conditions.push(`datecollected >= $${values.length + 1}`);
      values.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`datecollected <= $${values.length + 1}`);
      values.push(dateTo);
    }

    if (conditions.length) {
      const whereClause = ` WHERE ` + conditions.join(' AND ');
      baseQuery += whereClause;
    }

    const allowedSortColumns = ['datecollected', 'wastename', 'category', 'quantity', 'unit'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'datecollected';
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
        quantity: row.quantity,
        unit: row.unit,
        datecollected: row.datecollected,
        description: row.description,
        photourl: row.photourl,
        useremail: row.useremail
      }));

      return { data, total: parseInt(countResult.rows[0].total) };
    } catch (error) {
      console.error('SQL ERROR in getAllCollectWastes:', error.message);
      throw error;
    }
  }

  static async getDistinctUnits() {
    const query = `SELECT DISTINCT unit FROM collect_waste WHERE unit IS NOT NULL AND unit != '' ORDER BY unit`;
    try {
      const result = await pool.query(query);
      return result.rows.map(row => row.unit);
    } catch (error) {
      console.error('SQL ERROR in getDistinctUnits:', error.message);
      throw error;
    }
  }

  static async deleteCollectWaste(id) {
    const query = `DELETE FROM collect_waste WHERE id = $1 RETURNING *`;
    try {
      const result = await pool.query(query, [id]);
      if (result.rows[0]) {
        const row = result.rows[0];
        return {
          id: row.id,
          wastename: row.wastename,
          category: row.category,
          subcategory: row.subcategory,
          quantity: row.quantity,
          unit: row.unit,
          datecollected: row.datecollected,
          description: row.description,
          photourl: row.photourl,
          useremail: row.useremail
        };
      }
      return null;
    } catch (error) {
      console.error('SQL ERROR in deleteCollectWaste:', error.message);
      throw error;
    }
  }
}

export default AdminCollectWasteModel;