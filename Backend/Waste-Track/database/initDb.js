import pool from '../config/db.js';

const initDb = async () => {
  const client = await pool.connect();
  try {
    // ======================= 1. USER & ADMIN AUTHENTICATION =======================
    // Stores regular users (for User Management & Analytics)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Users-Login" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      ALTER TABLE "Users-Login" ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT
    `);

    // Stores admin users (for User Management & Analytics)
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Admins-Login" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await client.query(`
      ALTER TABLE "Admins-Login" ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT
    `);

    // Refresh tokens for users (used to determine online/offline status in User Management & Analytics)
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES "Users-Login"(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Refresh tokens for admins (used for online/offline status)
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_refresh_tokens (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        admin_id INTEGER NOT NULL REFERENCES "Admins-Login"(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ======================= 2. DASHBOARD SUMMARY (for User Dashboard) =======================
    await client.query(`
      CREATE TABLE IF NOT EXISTS dashboard_summary (
        id SERIAL PRIMARY KEY,
        useremail TEXT NOT NULL,
        year INT NOT NULL,
        month INT NOT NULL,
        collected_count INT DEFAULT 0,
        reported_count INT DEFAULT 0,
        UNIQUE (useremail, year, month)
      )
    `);

    // ======================= 3. COLLECTED WASTE (for Collected Waste Management & Analytics) =======================
    await client.query(`
      CREATE TABLE IF NOT EXISTS collect_waste (
        id SERIAL PRIMARY KEY,
        userEmail TEXT NOT NULL,
        wasteName TEXT NOT NULL,
        category TEXT NOT NULL,
        subCategory TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        dateCollected DATE NOT NULL,
        description TEXT NOT NULL,
        photoUrl TEXT NOT NULL
      )
    `);

    // Timeline table for collected waste (used in User Waste Timeline)
    await client.query(`
      CREATE TABLE IF NOT EXISTS collect_waste_timeline (
        id SERIAL PRIMARY KEY,
        waste_id INT UNIQUE REFERENCES collect_waste(id) ON DELETE CASCADE,
        useremail TEXT NOT NULL,
        wastename TEXT NOT NULL,
        datecollected DATE NOT NULL,
        yearcollected INT NOT NULL,
        description TEXT NOT NULL,
        photourl TEXT NOT NULL,
        UNIQUE (useremail, wastename, datecollected)
      )
    `);

    // Triggers to sync collect_waste with timeline
    await client.query(`
      CREATE OR REPLACE FUNCTION sync_collect_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO collect_waste_timeline
          (waste_id, useremail, wastename, datecollected, yearcollected, description, photourl)
        VALUES
          (NEW.id, NEW.useremail, NEW.wastename, NEW.datecollected, EXTRACT(YEAR FROM NEW.datecollected)::INT, NEW.description, NEW.photourl)
        ON CONFLICT (waste_id) DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS after_collect_insert ON collect_waste;`);
    await client.query(`
      CREATE TRIGGER after_collect_insert
      AFTER INSERT ON collect_waste
      FOR EACH ROW
      EXECUTE FUNCTION sync_collect_insert();
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION sync_collect_update()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE collect_waste_timeline
        SET useremail    = NEW.useremail,
            wastename    = NEW.wastename,
            datecollected = NEW.datecollected,
            yearcollected = EXTRACT(YEAR FROM NEW.datecollected)::INT,
            description   = NEW.description,
            photourl      = NEW.photourl
        WHERE waste_id = NEW.id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS after_collect_update ON collect_waste;`);
    await client.query(`
      CREATE TRIGGER after_collect_update
      AFTER UPDATE ON collect_waste
      FOR EACH ROW
      EXECUTE FUNCTION sync_collect_update();
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION sync_collect_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM collect_waste_timeline
        WHERE waste_id = OLD.id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS after_collect_delete ON collect_waste;`);
    await client.query(`
      CREATE TRIGGER after_collect_delete
      AFTER DELETE ON collect_waste
      FOR EACH ROW
      EXECUTE FUNCTION sync_collect_delete();
    `);

    // ======================= 4. REPORTED WASTE (for Reported Waste Management & Analytics) =======================
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_waste (
        id SERIAL PRIMARY KEY,
        userEmail TEXT NOT NULL,
        wasteName TEXT NOT NULL,
        category TEXT NOT NULL,
        subCategory TEXT NOT NULL,
        color TEXT NOT NULL,
        location TEXT NOT NULL,
        dateReported DATE NOT NULL,
        description TEXT NOT NULL,
        photoUrl TEXT NOT NULL
      )
    `);

    // Timeline for reported waste
    await client.query(`
      CREATE TABLE IF NOT EXISTS report_waste_timeline (
        id SERIAL PRIMARY KEY,
        report_id INT UNIQUE REFERENCES report_waste(id) ON DELETE CASCADE,
        useremail TEXT NOT NULL,
        wastename TEXT NOT NULL,
        datereported DATE NOT NULL,
        year_reported INT NOT NULL,
        location TEXT NOT NULL,
        description TEXT NOT NULL,
        photourl TEXT NOT NULL,
        UNIQUE (useremail, wastename, datereported)
      )
    `);

    // Triggers for report_waste -> timeline
    await client.query(`
      CREATE OR REPLACE FUNCTION sync_report_insert()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO report_waste_timeline
          (report_id, useremail, wastename, datereported, year_reported, location, description, photourl)
        VALUES
          (NEW.id, NEW.useremail, NEW.wastename, NEW.datereported, EXTRACT(YEAR FROM NEW.datereported)::INT, NEW.location, NEW.description, NEW.photourl)
        ON CONFLICT (report_id) DO NOTHING;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS after_report_insert ON report_waste;`);
    await client.query(`
      CREATE TRIGGER after_report_insert
      AFTER INSERT ON report_waste
      FOR EACH ROW
      EXECUTE FUNCTION sync_report_insert();
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION sync_report_update()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE report_waste_timeline
        SET useremail    = NEW.useremail,
            wastename    = NEW.wastename,
            datereported = NEW.datereported,
            year_reported = EXTRACT(YEAR FROM NEW.datereported)::INT,
            location     = NEW.location,
            description  = NEW.description,
            photourl     = NEW.photourl
        WHERE report_id = OLD.id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS after_report_update ON report_waste;`);
    await client.query(`
      CREATE TRIGGER after_report_update
      AFTER UPDATE ON report_waste
      FOR EACH ROW
      EXECUTE FUNCTION sync_report_update();
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION sync_report_delete()
      RETURNS TRIGGER AS $$
      BEGIN
        DELETE FROM report_waste_timeline
        WHERE report_id = OLD.id;
        RETURN OLD;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS after_report_delete ON report_waste;`);
    await client.query(`
      CREATE TRIGGER after_report_delete
      AFTER DELETE ON report_waste
      FOR EACH ROW
      EXECUTE FUNCTION sync_report_delete();
    `);

    // ======================= 5. DASHBOARD SUMMARY TRIGGERS (for User Dashboard) =======================
    await client.query(`
      CREATE OR REPLACE FUNCTION update_dashboard_summary_collect()
      RETURNS TRIGGER AS $$
      DECLARE
        v_year INT;
        v_month INT;
        v_useremail TEXT;
        v_collected_count INT;
      BEGIN
        IF TG_OP = 'DELETE' THEN
          v_useremail := OLD.useremail;
          v_year := EXTRACT(YEAR FROM OLD.dateCollected)::INT;
          v_month := EXTRACT(MONTH FROM OLD.dateCollected)::INT;
        ELSE
          v_useremail := NEW.useremail;
          v_year := EXTRACT(YEAR FROM NEW.dateCollected)::INT;
          v_month := EXTRACT(MONTH FROM NEW.dateCollected)::INT;
        END IF;

        SELECT COALESCE(COUNT(*), 0) INTO v_collected_count
        FROM collect_waste
        WHERE useremail = v_useremail
          AND EXTRACT(YEAR FROM dateCollected) = v_year
          AND EXTRACT(MONTH FROM dateCollected) = v_month;

        INSERT INTO dashboard_summary (useremail, year, month, collected_count, reported_count)
        VALUES (v_useremail, v_year, v_month, v_collected_count, 0)
        ON CONFLICT (useremail, year, month)
        DO UPDATE SET collected_count = EXCLUDED.collected_count;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS dashboard_collect_trigger ON collect_waste;`);
    await client.query(`
      CREATE TRIGGER dashboard_collect_trigger
      AFTER INSERT OR UPDATE OR DELETE ON collect_waste
      FOR EACH ROW
      EXECUTE FUNCTION update_dashboard_summary_collect();
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION update_dashboard_summary_report()
      RETURNS TRIGGER AS $$
      DECLARE
        v_year INT;
        v_month INT;
        v_useremail TEXT;
        v_reported_count INT;
      BEGIN
        IF TG_OP = 'DELETE' THEN
          v_useremail := OLD.useremail;
          v_year := EXTRACT(YEAR FROM OLD.dateReported)::INT;
          v_month := EXTRACT(MONTH FROM OLD.dateReported)::INT;
        ELSE
          v_useremail := NEW.useremail;
          v_year := EXTRACT(YEAR FROM NEW.dateReported)::INT;
          v_month := EXTRACT(MONTH FROM NEW.dateReported)::INT;
        END IF;

        SELECT COALESCE(COUNT(*), 0) INTO v_reported_count
        FROM report_waste
        WHERE useremail = v_useremail
          AND EXTRACT(YEAR FROM dateReported) = v_year
          AND EXTRACT(MONTH FROM dateReported) = v_month;

        INSERT INTO dashboard_summary (useremail, year, month, collected_count, reported_count)
        VALUES (v_useremail, v_year, v_month, 0, v_reported_count)
        ON CONFLICT (useremail, year, month)
        DO UPDATE SET reported_count = EXCLUDED.reported_count;

        RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `);
    await client.query(`DROP TRIGGER IF EXISTS dashboard_report_trigger ON report_waste;`);
    await client.query(`
      CREATE TRIGGER dashboard_report_trigger
      AFTER INSERT OR UPDATE OR DELETE ON report_waste
      FOR EACH ROW
      EXECUTE FUNCTION update_dashboard_summary_report();
    `);

    console.log('All tables created / verified successfully');
    console.log('Tables for Analytics: "Users-Login", "Admins-Login", "collect_waste", "report_waste"');
    console.log('Tables for User Management: "Users-Login", "Admins-Login", "refresh_tokens", "admin_refresh_tokens"');
    console.log('Tables for Collected Waste: "collect_waste", "collect_waste_timeline"');
    console.log('Tables for Reported Waste: "report_waste", "report_waste_timeline"');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default initDb;