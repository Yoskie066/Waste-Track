import pool from '../config/db.js';

const initDb = async () => {
  const client = await pool.connect();
  try {
    // ----- Users tables -----
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES "Users-Login"(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ----- Collect Waste tables -----
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
      );
    `);

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
      );
    `);

    // Insert
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

    // Update
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

    // Delete
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

    // ----- Report Waste tables -----
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
      );
    `);

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
      );
    `);

    // Trigger for report_waste insert
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

    // Trigger for report_waste update
    await client.query(`
      CREATE OR REPLACE FUNCTION sync_report_update()
      RETURNS TRIGGER AS $$
      BEGIN
          UPDATE report_waste_timeline
          SET useremail    = NEW.useremail,
              wastename    = NEW.wastename,
              datereported = NEW.datereported,
              year_reported= EXTRACT(YEAR FROM NEW.datereported)::INT,
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

    // Trigger for report_waste delete
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

    // ----- Admin tables -----
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_refresh_tokens (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        admin_id INTEGER NOT NULL REFERENCES "Admins-Login"(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('All tables created / verified successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    client.release();
  }
};

export default initDb;