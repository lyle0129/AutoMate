import { neon } from "@neondatabase/serverless";
import "dotenv/config";

export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    // OWNERS (must be created first since users references it)
    await sql`
      CREATE TABLE IF NOT EXISTS owners (
        owner_id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        contact VARCHAR(50),
        vehicle_ids INTEGER[] DEFAULT '{}'
      )
    `;

    // USERS
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'mechanic', 'customer')),
        owner_id INTEGER REFERENCES owners(owner_id) ON DELETE SET NULL
      )
    `;

    // VEHICLES
    await sql`
      CREATE TABLE IF NOT EXISTS vehicles (
        vehicle_id SERIAL PRIMARY KEY,
        plate_no VARCHAR(50) UNIQUE NOT NULL,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        vehicle_type VARCHAR(50) NOT NULL,
        owner_id INTEGER REFERENCES owners(owner_id) ON DELETE SET NULL
      )
    `;

    // SERVICES
    await sql`
      CREATE TABLE IF NOT EXISTS services (
        service_id SERIAL PRIMARY KEY,
        service_name VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        vehicle_types VARCHAR(100)[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // MAINTENANCE LOGS
    await sql`
      CREATE TABLE IF NOT EXISTS maintenance_logs (
        log_id SERIAL PRIMARY KEY,
        vehicle_id INTEGER REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
        date DATE NOT NULL,
        cost DECIMAL(10,2),
        description TEXT,
        user_name VARCHAR(100) NOT NULL,
        owner_id INTEGER REFERENCES owners(owner_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing DB", error);
    process.exit(1);
  }
}
