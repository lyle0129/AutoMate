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
        contact VARCHAR(50)
      )
    `;

    // USERS
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_name VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'mechanic', 'customer')),
        owner_id INTEGER REFERENCES owners(owner_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        cost DECIMAL(10,2),
        description JSONB,
        user_name VARCHAR(100) NOT NULL,
        owner_id INTEGER REFERENCES owners(owner_id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        paid_at TIMESTAMP NULL,
        paid_using VARCHAR(50) NULL
      )
    `;

    // Create default admin user if no users exist
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    if (existingUsers[0].count === '0') {
      // Import bcrypt here to avoid circular dependency
      const bcrypt = await import('bcrypt');
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.default.hash(defaultPassword, 10);
      
      await sql`
        INSERT INTO users (user_name, password_hash, role)
        VALUES ('admin', ${hashedPassword}, 'admin')
      `;
      
      console.log("✅ Default admin user created (username: admin, password: admin123)");
    }

    // Create sample data if tables are empty
    const existingOwners = await sql`SELECT COUNT(*) as count FROM owners`;
    if (existingOwners[0].count === '0') {
      await sql`
        INSERT INTO owners (name, contact) VALUES 
        ('John Smith', '555-0101'),
        ('Jane Doe', '555-0102'),
        ('Bob Johnson', '555-0103')
      `;
      console.log("✅ Sample owners created");
    }

    const existingServices = await sql`SELECT COUNT(*) as count FROM services`;
    if (existingServices[0].count === '0') {
      await sql`
        INSERT INTO services (service_name, price, vehicle_types) VALUES 
        ('Oil Change', 29.99, ARRAY['Car', 'SUV', 'Truck']),
        ('Brake Inspection', 49.99, ARRAY['Car', 'SUV', 'Truck', 'Motorcycle']),
        ('Tire Rotation', 19.99, ARRAY['Car', 'SUV', 'Truck']),
        ('Engine Tune-up', 199.99, ARRAY['Car', 'SUV', 'Truck']),
        ('Motorcycle Service', 89.99, ARRAY['Motorcycle'])
      `;
      console.log("✅ Sample services created");
    }

    const existingVehicles = await sql`SELECT COUNT(*) as count FROM vehicles`;
    if (existingVehicles[0].count === '0') {
      await sql`
        INSERT INTO vehicles (plate_no, make, model, year, vehicle_type, owner_id) VALUES 
        ('ABC-123', 'Toyota', 'Camry', 2020, 'Car', 1),
        ('XYZ-789', 'Ford', 'F-150', 2019, 'Truck', 2),
        ('DEF-456', 'Honda', 'Civic', 2021, 'Car', 3),
        ('GHI-012', 'Harley-Davidson', 'Street 750', 2018, 'Motorcycle', 1)
      `;
      console.log("✅ Sample vehicles created");
    }

    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing DB", error);
    process.exit(1);
  }
}
