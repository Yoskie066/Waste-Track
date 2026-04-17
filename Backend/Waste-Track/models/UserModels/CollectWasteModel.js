import pool from '../../config/db.js';

class CollectWasteModel {
  static async addCollectWaste(data) {
    const {
      userEmail,
      wasteName,
      category,
      subCategory,
      quantity,
      unit,
      dateCollected,
      description,
      photoUrl
    } = data;

    const query = `
      INSERT INTO collect_waste
      (userEmail, wasteName, category, subCategory, quantity, unit, dateCollected, description, photoUrl)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id
    `;
    const values = [userEmail, wasteName, category, subCategory, quantity, unit, dateCollected, description, photoUrl];
    const result = await pool.query(query, values);
    return { id: result.rows[0].id };
  }

  static async updateCollectWaste(id, data) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.wasteName !== undefined) {
      fields.push(`wasteName = $${idx++}`);
      values.push(data.wasteName);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${idx++}`);
      values.push(data.category);
    }
    if (data.subCategory !== undefined) {
      fields.push(`subCategory = $${idx++}`);
      values.push(data.subCategory);
    }
    if (data.quantity !== undefined) {
      fields.push(`quantity = $${idx++}`);
      values.push(data.quantity);
    }
    if (data.unit !== undefined) {
      fields.push(`unit = $${idx++}`);
      values.push(data.unit);
    }
    if (data.dateCollected !== undefined) {
      fields.push(`dateCollected = $${idx++}`);
      values.push(data.dateCollected);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.photoUrl !== undefined) {
      fields.push(`photoUrl = $${idx++}`);
      values.push(data.photoUrl);
    }

    if (fields.length === 0) return null;
    values.push(id);
    const query = `
      UPDATE collect_waste
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async deleteCollectWaste(id) {
    const query = `DELETE FROM collect_waste WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getUserCollectWastes(userEmail) {
    const query = `SELECT * FROM collect_waste WHERE userEmail = $1 ORDER BY dateCollected DESC`;
    const result = await pool.query(query, [userEmail]);
    return result.rows;
  }

  static async getCollectWasteById(id) {
    const query = `SELECT * FROM collect_waste WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default CollectWasteModel;