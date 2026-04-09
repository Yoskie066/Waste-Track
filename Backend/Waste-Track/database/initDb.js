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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add google_id column if missing (for existing tables)
    await client.query(`
      ALTER TABLE "Users-Login" ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        token TEXT NOT NULL,
        user_id INTEGER NOT NULL REFERENCES "Users-Login"(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // ----- Admin tables -----
    await client.query(`
      CREATE TABLE IF NOT EXISTS "Admins-Login" (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        google_id VARCHAR(255) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add google_id column if missing (for existing admin tables)
    await client.query(`
      ALTER TABLE "Admins-Login" ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE
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