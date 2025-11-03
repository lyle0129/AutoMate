import { sql } from "../config/db.js";

// Create a new service
export const createService = async (service_name, price, vehicle_types = []) => {
  try {
    const result = await sql`
      INSERT INTO services (service_name, price, vehicle_types)
      VALUES (${service_name}, ${price}, ${vehicle_types})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error creating service:", error);
    throw error;
  }
};

// Find service by ID
export const findServiceById = async (service_id) => {
  try {
    const result = await sql`
      SELECT * FROM services WHERE service_id = ${service_id}
    `;
    return result[0];
  } catch (error) {
    console.error("Error finding service:", error);
    throw error;
  }
};

// Get all services
export const getAllServices = async () => {
  try {
    const result = await sql`
      SELECT * FROM services ORDER BY service_id ASC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching all services:", error);
    throw error;
  }
};

// Update service by ID
export const updateService = async (service_id, service_name, price, vehicle_types) => {
  try {
    const result = await sql`
      UPDATE services
      SET
        service_name = COALESCE(${service_name}, service_name),
        price = COALESCE(${price}, price),
        vehicle_types = COALESCE(${vehicle_types}, vehicle_types)
      WHERE service_id = ${service_id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

// Delete service by ID
export const deleteService = async (service_id) => {
  try {
    const result = await sql`
      DELETE FROM services
      WHERE service_id = ${service_id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

// Get services by vehicle type compatibility
export const getServicesByVehicleType = async (vehicle_type) => {
  try {
    const result = await sql`
      SELECT * FROM services 
      WHERE ${vehicle_type} = ANY(vehicle_types) OR array_length(vehicle_types, 1) IS NULL
      ORDER BY service_id ASC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching services by vehicle type:", error);
    throw error;
  }
};

// Check if service is compatible with vehicle type
export const isServiceCompatible = async (service_id, vehicle_type) => {
  try {
    const result = await sql`
      SELECT service_id FROM services 
      WHERE service_id = ${service_id} 
      AND (${vehicle_type} = ANY(vehicle_types) OR array_length(vehicle_types, 1) IS NULL)
    `;
    return result.length > 0;
  } catch (error) {
    console.error("Error checking service compatibility:", error);
    throw error;
  }
};

// Find service by name (for uniqueness validation)
export const findServiceByName = async (service_name) => {
  try {
    const result = await sql`
      SELECT * FROM services WHERE service_name = ${service_name}
    `;
    return result[0];
  } catch (error) {
    console.error("Error finding service by name:", error);
    throw error;
  }
};

// Validate service pricing (any valid number, including negative for discounts)
export const validateServicePrice = (price) => {
  const numPrice = parseFloat(price);
  return !isNaN(numPrice) && isFinite(numPrice);
};

// Validate vehicle types array
export const validateVehicleTypes = (vehicle_types) => {
  if (!Array.isArray(vehicle_types)) {
    return false;
  }
  
  // Check if all elements are strings and not empty
  return vehicle_types.every(type => 
    typeof type === 'string' && type.trim().length > 0
  );
};