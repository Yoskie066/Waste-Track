import pool from '../../config/db.js';

class WasteTimelineModel {
  /**
   * Fetch all timeline entries (collected + reported) for a given user
   * Returns combined array sorted by date (descending)
   */
  static async getUserTimeline(userEmail) {
    const client = await pool.connect();
    try {
      // Collect waste timeline
      const collectQuery = `
        SELECT
          id,
          waste_id AS original_id,
          useremail,
          wastename AS waste_name,
          datecollected AS event_date,
          description,
          photourl AS photo_url,
          'collect' AS type
        FROM collect_waste_timeline
        WHERE useremail = $1
      `;

      // Report waste timeline
      const reportQuery = `
        SELECT
          id,
          report_id AS original_id,
          useremail,
          wastename AS waste_name,
          datereported AS event_date,
          description,
          photourl AS photo_url,
          'report' AS type
        FROM report_waste_timeline
        WHERE useremail = $1
      `;

      const collectResult = await client.query(collectQuery, [userEmail]);
      const reportResult = await client.query(reportQuery, [userEmail]);

      const combined = [...collectResult.rows, ...reportResult.rows];

      // Sort by event_date descending (latest first)
      combined.sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

      return combined;
    } finally {
      client.release();
    }
  }
}

export default WasteTimelineModel;