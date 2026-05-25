import pool from '../../config/db.js';

class UserManagementModel {
  static async getAllUsersAndAdmins({
    page, limit, search, role, status, month, year, sortBy = 'created_at', sortOrder = 'DESC'
  }) {
    const offset = (page - 1) * limit;
    const values = [];
    let paramIndex = 1;

    const buildWhereClause = () => {
      let where = '';
      if (search) {
        where += ` AND email ILIKE $${paramIndex++}`;
        values.push(`%${search}%`);
      }
      if (role && role !== 'all') {
        where += ` AND role = $${paramIndex++}`;
        values.push(role);
      }
      if (status && status !== 'all') {
        where += ` AND status = $${paramIndex++}`;
        values.push(status);
      }
      if (month && month !== 'all') {
        where += ` AND EXTRACT(MONTH FROM created_at) = $${paramIndex++}::int`;
        values.push(parseInt(month));
      }
      if (year && year !== 'all') {
        where += ` AND EXTRACT(YEAR FROM created_at) = $${paramIndex++}::int`;
        values.push(parseInt(year));
      }
      return where;
    };

    const whereClause = buildWhereClause();

    const mainQuery = `
      WITH combined AS (
        SELECT 
          u.id,
          u.email,
          'user' AS role,
          u.created_at,
          u.updated_at,
          u.avatar_url,
          CASE 
            WHEN EXISTS (SELECT 1 FROM refresh_tokens rt WHERE rt.user_id = u.id AND rt.created_at > NOW() - INTERVAL '15 minutes')
            THEN 'online' ELSE 'offline'
          END AS status
        FROM "Users-Login" u
        
        UNION ALL
        
        SELECT 
          a.id,
          a.email,
          'admin' AS role,
          a.created_at,
          a.updated_at,
          a.avatar_url,
          CASE 
            WHEN EXISTS (SELECT 1 FROM admin_refresh_tokens art WHERE art.admin_id = a.id AND art.created_at > NOW() - INTERVAL '15 minutes')
            THEN 'online' ELSE 'offline'
          END AS status
        FROM "Admins-Login" a
      )
      SELECT * FROM combined
      WHERE 1=1 ${whereClause}
      ORDER BY "${sortBy}" ${sortOrder === 'DESC' ? 'DESC' : 'ASC'}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(limit, offset);

    // Count query
    const countValues = [];
    let countIndex = 1;
    const countWhereClause = () => {
      let where = '';
      if (search) {
        where += ` AND email ILIKE $${countIndex++}`;
        countValues.push(`%${search}%`);
      }
      if (role && role !== 'all') {
        where += ` AND role = $${countIndex++}`;
        countValues.push(role);
      }
      if (status && status !== 'all') {
        where += ` AND status = $${countIndex++}`;
        countValues.push(status);
      }
      if (month && month !== 'all') {
        where += ` AND EXTRACT(MONTH FROM created_at) = $${countIndex++}::int`;
        countValues.push(parseInt(month));
      }
      if (year && year !== 'all') {
        where += ` AND EXTRACT(YEAR FROM created_at) = $${countIndex++}::int`;
        countValues.push(parseInt(year));
      }
      return where;
    };
    const countWhere = countWhereClause();

    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT 
          u.email,
          'user' AS role,
          u.created_at,
          CASE 
            WHEN EXISTS (SELECT 1 FROM refresh_tokens rt WHERE rt.user_id = u.id AND rt.created_at > NOW() - INTERVAL '15 minutes')
            THEN 'online' ELSE 'offline'
          END AS status
        FROM "Users-Login" u
        UNION ALL
        SELECT 
          a.email,
          'admin' AS role,
          a.created_at,
          CASE 
            WHEN EXISTS (SELECT 1 FROM admin_refresh_tokens art WHERE art.admin_id = a.id AND art.created_at > NOW() - INTERVAL '15 minutes')
            THEN 'online' ELSE 'offline'
          END AS status
        FROM "Admins-Login" a
      ) AS combined
      WHERE 1=1 ${countWhere}
    `;

    try {
      const dataResult = await pool.query(mainQuery, values);
      const countResult = await pool.query(countQuery, countValues);
      const total = parseInt(countResult.rows[0].total);

      const data = dataResult.rows.map(row => ({
        id: row.id,
        email: row.email,
        role: row.role,
        status: row.status,
        created_at: row.created_at,
        updated_at: row.updated_at,
        avatar_url: row.avatar_url
      }));

      return { data, total };
    } catch (error) {
      console.error('SQL ERROR in getAllUsersAndAdmins:', error.message);
      console.error('Query:', mainQuery);
      console.error('Values:', values);
      throw error;
    }
  }

  static async getDistinctYears() {
    const query = `
      SELECT DISTINCT EXTRACT(YEAR FROM created_at) as year FROM (
        SELECT created_at FROM "Users-Login"
        UNION ALL
        SELECT created_at FROM "Admins-Login"
      ) as combined
      WHERE created_at IS NOT NULL
      ORDER BY year DESC
    `;
    try {
      const result = await pool.query(query);
      return result.rows.map(row => row.year.toString());
    } catch (error) {
      console.error('SQL ERROR in getDistinctYears:', error.message);
      throw error;
    }
  }

  static async deleteUserOrAdmin(id, role) {
    const table = role === 'user' ? '"Users-Login"' : '"Admins-Login"';
    const query = `DELETE FROM ${table} WHERE id = $1 RETURNING id, email`;
    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) return null;
      return result.rows[0];
    } catch (error) {
      console.error(`SQL ERROR in deleteUserOrAdmin (${role}):`, error.message);
      throw error;
    }
  }
}

export default UserManagementModel;