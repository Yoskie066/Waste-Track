import pool from '../../config/db.js';

class WasteTimelineModel {
  /**
   * Fetch all timeline entries (collected + reported) for a given user
   * Returns combined array (unsorted – frontend will sort)
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
      // No sorting here – frontend will sort based on user preference
      return combined;
    } finally {
      client.release();
    }
  }
}

export default WasteTimelineModel;