import pool from '../../config/db.js';

class ReportWasteModel {
  static async addReport(reportData) {
    const {
      userEmail,
      wasteName,
      category,
      subCategory,
      color,
      location,
      dateReported,
      description,
      photoUrl
    } = reportData;

    const query = `
      INSERT INTO report_waste
      (userEmail, wasteName, category, subCategory, color, location, dateReported, description, photoUrl)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING id
    `;
    const values = [userEmail, wasteName, category, subCategory, color, location, dateReported, description, photoUrl];
    const result = await pool.query(query, values);
    return { id: result.rows[0].id };
  }

  static async updateReport(id, reportData) {
    // Build dynamic SET clause – only update fields that are provided
    const fields = [];
    const values = [];
    let idx = 1;

    if (reportData.wasteName !== undefined) {
      fields.push(`wasteName = $${idx++}`);
      values.push(reportData.wasteName);
    }
    if (reportData.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(reportData.category);
    }
    if (reportData.subCategory !== undefined) {
      fields.push(`subCategory = $${idx++}`);
      values.push(reportData.subCategory);
    }
    if (reportData.color !== undefined) {
      fields.push(`color = $${idx++}`);
      values.push(reportData.color);
    }
    if (reportData.location !== undefined) {
      fields.push(`location = $${idx++}`);
      values.push(reportData.location);
    }
    if (reportData.dateReported !== undefined) {
      fields.push(`dateReported = $${idx++}`);
      values.push(reportData.dateReported);
    }
    if (reportData.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(reportData.description);
    }
    if (reportData.photoUrl !== undefined) {
      fields.push(`photoUrl = $${idx++}`);
      values.push(reportData.photoUrl);
    }

    if (fields.length === 0) return null; // nothing to update

    values.push(id);
    const query = `
      UPDATE report_waste
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deleteReport(id) {
    const query = `DELETE FROM report_waste WHERE id=$1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getUserReports(userEmail) {
    const query = `SELECT * FROM report_waste WHERE userEmail = $1 ORDER BY dateReported DESC`;
    const result = await pool.query(query, [userEmail]);
    return result.rows;
  }

  static async getReportById(id) {
    const query = `SELECT * FROM report_waste WHERE id=$1;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default ReportWasteModel;