import { sql } from "../config/db.js";

// Create a new owner
export const createOwner = async (name, contact) => {
  try {
    const result = await sql`
      INSERT INTO owners (name, contact)
      VALUES (${name}, ${contact})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error creating owner:", error);
    throw error;
  }
};

// Find owner by ID
export const findOwnerById = async (owner_id) => {
  try {
    const result = await sql`
      SELECT * FROM owners WHERE owner_id = ${owner_id}
    `;
    return result[0];
  } catch (error) {
    console.error("Error finding owner:", error);
    throw error;
  }
};

// Get all owners
export const getAllOwners = async () => {
  try {
    const result = await sql`
      SELECT * FROM owners ORDER BY owner_id ASC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching all owners:", error);
    throw error;
  }
};

// Update owner by ID
export const updateOwner = async (owner_id, name, contact) => {
  try {
    const result = await sql`
      UPDATE owners
      SET
        name = COALESCE(${name}, name),
        contact = COALESCE(${contact}, contact)
      WHERE owner_id = ${owner_id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error updating owner:", error);
    throw error;
  }
};

// Delete owner by ID
export const deleteOwner = async (owner_id) => {
  try {
    const result = await sql`
      DELETE FROM owners
      WHERE owner_id = ${owner_id}
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error deleting owner:", error);
    throw error;
  }
};

// Get vehicles owned by a specific owner
export const getVehiclesByOwnerId = async (owner_id) => {
  try {
    const result = await sql`
      SELECT * FROM vehicles 
      WHERE owner_id = ${owner_id}
      ORDER BY vehicle_id ASC
    `;
    return result;
  } catch (error) {
    console.error("Error fetching vehicles by owner:", error);
    throw error;
  }
};



// Get owner with their vehicles (joined data)
export const getOwnerWithVehicles = async (owner_id) => {
  try {
    const owner = await findOwnerById(owner_id);
    if (!owner) {
      return null;
    }

    const vehicles = await getVehiclesByOwnerId(owner_id);

    return {
      ...owner,
      vehicles: vehicles
    };
  } catch (error) {
    console.error("Error fetching owner with vehicles:", error);
    throw error;
  }
};