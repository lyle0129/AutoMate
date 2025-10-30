import { sql } from "../config/db.js";

// 📘 GET all vehicles
export const getAllVehicles = async (req, res) => {
  try {
    const vehicles = await sql`SELECT * FROM vehicles ORDER BY vehicle_id ASC`;
    res.status(200).json(vehicles);
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📘 GET single vehicle by ID
export const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await sql`SELECT * FROM vehicles WHERE vehicle_id = ${id}`;
    if (vehicle.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }
    res.status(200).json(vehicle[0]);
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🧾 CREATE new vehicle
export const createVehicle = async (req, res) => {
  try {
    const { plate_no, make, model, year, vehicle_type, owner_id } = req.body;

    if (!plate_no || !make || !model || !year || !vehicle_type) {
      return res.status(400).json({ message: "All fields except owner_id are required" });
    }

    const newVehicle = await sql`
      INSERT INTO vehicles (plate_no, make, model, year, vehicle_type, owner_id)
      VALUES (${plate_no}, ${make}, ${model}, ${year}, ${vehicle_type}, ${owner_id})
      RETURNING *
    `;

    res.status(201).json({
      message: "Vehicle added successfully",
      vehicle: newVehicle[0],
    });
  } catch (error) {
    console.error("Error adding vehicle:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🧾 UPDATE vehicle by ID
export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { plate_no, make, model, year, vehicle_type, owner_id } = req.body;

    const updated = await sql`
      UPDATE vehicles
      SET
        plate_no = COALESCE(${plate_no}, plate_no),
        make = COALESCE(${make}, make),
        model = COALESCE(${model}, model),
        year = COALESCE(${year}, year),
        vehicle_type = COALESCE(${vehicle_type}, vehicle_type),
        owner_id = COALESCE(${owner_id}, owner_id)
      WHERE vehicle_id = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({
      message: "Vehicle updated successfully",
      vehicle: updated[0],
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🗑️ DELETE vehicle by ID
export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await sql`
      DELETE FROM vehicles
      WHERE vehicle_id = ${id}
      RETURNING *
    `;

    if (deleted.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({
      message: "Vehicle deleted successfully",
      vehicle: deleted[0],
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
