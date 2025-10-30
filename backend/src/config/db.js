import {neon} from "@neondatabase/serverless"

import "dotenv/config"; 

// Create a SQL connection using our DB URL
export const sql = neon(process.env.DATABASE_URL)

export const initDB = async () => {
    await sql.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'mechanic', 'customer')),
        owner_id INTEGER
      );
    `);
    console.log("✅ Database initialized");
  };