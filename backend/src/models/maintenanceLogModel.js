import { sql } from "../config/db.js";

// Create a new maintenance log with service integration
export const createMaintenanceLog = async (vehicle_id, cost, description, user_name, service_ids = []) => {
  try {
    // First, get the owner_id and vehicle_type from the vehicle
    const vehicleResult = await sql`
      SELECT owner_id, vehicle_type FROM vehicles WHERE vehicle_id = ${vehicle_id}
    `;
    
    if (vehicleResult.length === 0) {
      throw new Error("Vehicle not found");
    }
    
    const { owner_id, vehicle_type } = vehicleResult[0];
    
    // If service_ids are provided, fetch service details and calculate total cost
    let services = [];
    let calculatedCost = cost;
    
    if (service_ids && service_ids.length > 0) {
      const serviceResults = await sql`
        SELECT service_id, service_name, price, vehicle_types
        FROM services 
        WHERE service_id = ANY(${service_ids})
      `;
      
      // Validate service compatibility with vehicle type
      for (const service of serviceResults) {
        if (service.vehicle_types.length > 0 && !service.vehicle_types.includes(vehicle_type)) {
          throw new Error(`Service "${service.service_name}" is not compatible with vehicle type "${vehicle_type}"`);
        }
      }
      
      services = serviceResults;
      
      // Calculate total cost from services if not provided
      if (calculatedCost === null || calculatedCost === undefined) {
        calculatedCost = services.reduce((total, service) => total + parseFloat(service.price), 0);
      }
    }
    
    // Prepare description object with services and custom description
    const descriptionObj = {
      custom_description: description || null,
      services: services.map(service => ({
        service_id: service.service_id,
        service_name: service.service_name,
        price: parseFloat(service.price)
      }))
    };
    
    const result = await sql`
      INSERT INTO maintenance_logs (vehicle_id, cost, description, user_name, owner_id)
      VALUES (${vehicle_id}, ${calculatedCost}, ${JSON.stringify(descriptionObj)}, ${user_name}, ${owner_id})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error creating maintenance log:", error);
    throw error;
  }
};

// Find maintenance log by ID
export const findMaintenanceLogById = async (log_id) => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      WHERE ml.log_id = ${log_id}
    `;
    return result[0];
  } catch (error) {
    console.error("Error finding maintenance log:", error);
    throw error;
  }
};

// Get all maintenance logs with chronological ordering
export const getAllMaintenanceLogs = async () => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      ORDER BY ml.created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching all maintenance logs:", error);
    throw error;
  }
};

// Get maintenance logs filtered by owner_id (for customers)
export const getMaintenanceLogsByOwnerId = async (owner_id) => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      WHERE ml.owner_id = ${owner_id}
      ORDER BY ml.created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching maintenance logs by owner:", error);
    throw error;
  }
};

// Get maintenance logs by vehicle_id
export const getMaintenanceLogsByVehicleId = async (vehicle_id) => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      WHERE ml.vehicle_id = ${vehicle_id}
      ORDER BY ml.created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching maintenance logs by vehicle:", error);
    throw error;
  }
};

// Get maintenance logs by mechanic (user_name)
export const getMaintenanceLogsByMechanic = async (user_name) => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      WHERE ml.user_name = ${user_name}
      ORDER BY ml.created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching maintenance logs by mechanic:", error);
    throw error;
  }
};

// Update maintenance log by ID
export const updateMaintenanceLog = async (log_id, cost, description) => {
  try {
    const result = await sql`
      UPDATE maintenance_logs
      SET
        cost = COALESCE(${cost}, cost),
        description = COALESCE(${description}, description)
      WHERE log_id = ${log_id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error updating maintenance log:", error);
    throw error;
  }
};

// Delete maintenance log by ID
export const deleteMaintenanceLog = async (log_id) => {
  try {
    const result = await sql`
      DELETE FROM maintenance_logs
      WHERE log_id = ${log_id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error deleting maintenance log:", error);
    throw error;
  }
};

// Validate vehicle exists and get owner_id
export const validateVehicleAndGetOwner = async (vehicle_id) => {
  try {
    const result = await sql`
      SELECT vehicle_id, owner_id, plate_no, make, model, year, vehicle_type
      FROM vehicles 
      WHERE vehicle_id = ${vehicle_id}
    `;
    return result[0];
  } catch (error) {
    console.error("Error validating vehicle:", error);
    throw error;
  }
};

// Get maintenance history summary for a vehicle
export const getMaintenanceHistorySummary = async (vehicle_id) => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_services,
        COALESCE(SUM(cost), 0) as total_cost,
        MAX(created_at) as last_service_date,
        MIN(created_at) as first_service_date
      FROM maintenance_logs
      WHERE vehicle_id = ${vehicle_id}
    `;
    return result[0];
  } catch (error) {
    console.error("Error fetching maintenance history summary:", error);
    throw error;
  }
};

// Get available services for a vehicle type
export const getServicesForVehicleType = async (vehicle_type) => {
  try {
    const result = await sql`
      SELECT service_id, service_name, price, vehicle_types
      FROM services 
      WHERE ${vehicle_type} = ANY(vehicle_types) OR array_length(vehicle_types, 1) IS NULL
      ORDER BY service_name ASC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching services for vehicle type:", error);
    throw error;
  }
};

// Validate service compatibility with vehicle
export const validateServicesForVehicle = async (vehicle_id, service_ids) => {
  try {
    // Get vehicle type
    const vehicleResult = await sql`
      SELECT vehicle_type FROM vehicles WHERE vehicle_id = ${vehicle_id}
    `;
    
    if (vehicleResult.length === 0) {
      throw new Error("Vehicle not found");
    }
    
    const vehicle_type = vehicleResult[0].vehicle_type;
    
    // Get services and check compatibility
    const serviceResults = await sql`
      SELECT service_id, service_name, price, vehicle_types
      FROM services 
      WHERE service_id = ANY(${service_ids})
    `;
    
    const incompatibleServices = serviceResults.filter(service => 
      service.vehicle_types.length > 0 && !service.vehicle_types.includes(vehicle_type)
    );
    
    return {
      compatible: incompatibleServices.length === 0,
      incompatible_services: incompatibleServices,
      vehicle_type: vehicle_type
    };
  } catch (error) {
    console.error("Error validating services for vehicle:", error);
    throw error;
  }
};

// PAYMENT TRACKING METHODS

// Mark maintenance log as paid
export const markMaintenanceLogAsPaid = async (log_id, paid_using) => {
  try {
    const result = await sql`
      UPDATE maintenance_logs
      SET
        paid_at = CURRENT_TIMESTAMP,
        paid_using = ${paid_using}
      WHERE log_id = ${log_id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error marking maintenance log as paid:", error);
    throw error;
  }
};

// Mark maintenance log as unpaid (remove payment info)
export const markMaintenanceLogAsUnpaid = async (log_id) => {
  try {
    const result = await sql`
      UPDATE maintenance_logs
      SET
        paid_at = NULL,
        paid_using = NULL
      WHERE log_id = ${log_id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error marking maintenance log as unpaid:", error);
    throw error;
  }
};

// Update payment method for a paid maintenance log
export const updatePaymentMethod = async (log_id, paid_using) => {
  try {
    const result = await sql`
      UPDATE maintenance_logs
      SET paid_using = ${paid_using}
      WHERE log_id = ${log_id} AND paid_at IS NOT NULL
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error updating payment method:", error);
    throw error;
  }
};

// Get all unpaid maintenance logs
export const getUnpaidMaintenanceLogs = async () => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      WHERE ml.paid_at IS NULL
      ORDER BY ml.created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching unpaid maintenance logs:", error);
    throw error;
  }
};

// Get unpaid maintenance logs by owner_id (for customers)
export const getUnpaidMaintenanceLogsByOwnerId = async (owner_id) => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      WHERE ml.owner_id = ${owner_id} AND ml.paid_at IS NULL
      ORDER BY ml.created_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching unpaid maintenance logs by owner:", error);
    throw error;
  }
};

// Get paid maintenance logs
export const getPaidMaintenanceLogs = async () => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      WHERE ml.paid_at IS NOT NULL
      ORDER BY ml.paid_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching paid maintenance logs:", error);
    throw error;
  }
};

// Get paid maintenance logs by owner_id (for customers)
export const getPaidMaintenanceLogsByOwnerId = async (owner_id) => {
  try {
    const result = await sql`
      SELECT ml.*, v.plate_no, v.make, v.model, v.year, v.vehicle_type, o.name as owner_name
      FROM maintenance_logs ml
      LEFT JOIN vehicles v ON ml.vehicle_id = v.vehicle_id
      LEFT JOIN owners o ON ml.owner_id = o.owner_id
      WHERE ml.owner_id = ${owner_id} AND ml.paid_at IS NOT NULL
      ORDER BY ml.paid_at DESC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching paid maintenance logs by owner:", error);
    throw error;
  }
};

// Get payment summary for an owner
export const getPaymentSummaryByOwnerId = async (owner_id) => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(CASE WHEN paid_at IS NOT NULL THEN 1 END) as paid_logs,
        COUNT(CASE WHEN paid_at IS NULL THEN 1 END) as unpaid_logs,
        COALESCE(SUM(CASE WHEN paid_at IS NOT NULL THEN cost END), 0) as total_paid_amount,
        COALESCE(SUM(CASE WHEN paid_at IS NULL THEN cost END), 0) as total_unpaid_amount,
        COALESCE(SUM(cost), 0) as total_amount
      FROM maintenance_logs
      WHERE owner_id = ${owner_id}
    `;
    return result[0];
  } catch (error) {
    console.error("Error fetching payment summary by owner:", error);
    throw error;
  }
};

// Get payment summary for all maintenance logs (admin only)
export const getOverallPaymentSummary = async () => {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(CASE WHEN paid_at IS NOT NULL THEN 1 END) as paid_logs,
        COUNT(CASE WHEN paid_at IS NULL THEN 1 END) as unpaid_logs,
        COALESCE(SUM(CASE WHEN paid_at IS NOT NULL THEN cost END), 0) as total_paid_amount,
        COALESCE(SUM(CASE WHEN paid_at IS NULL THEN cost END), 0) as total_unpaid_amount,
        COALESCE(SUM(cost), 0) as total_amount
      FROM maintenance_logs
    `;
    return result[0];
  } catch (error) {
    console.error("Error fetching overall payment summary:", error);
    throw error;
  }
};

// Validate payment method
export const validatePaymentMethod = (paid_using) => {
  const validMethods = ['cash', 'card', 'bank_transfer', 'check', 'mobile_payment', 'other'];
  return validMethods.includes(paid_using.toLowerCase());
};