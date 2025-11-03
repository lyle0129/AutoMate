import {
  createOwner,
  findOwnerById,
  getAllOwners,
  updateOwner,
  deleteOwner,
  getVehiclesByOwnerId,
  getOwnerWithVehicles
} from "../models/ownerModel.js";

// 📘 GET all owners (admin, mechanic only)
export const getAllOwnersController = async (req, res) => {
  try {
    const owners = await getAllOwners();
    res.status(200).json(owners);
  } catch (error) {
    console.error("Error fetching owners:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📘 GET single owner by ID with role-based filtering
export const getOwnerById = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, owner_id: userOwnerId } = req.user;

    // For customers, only allow access to their own owner record
    if (role === 'customer' && parseInt(id) !== userOwnerId) {
      return res.status(403).json({ 
        message: "Access denied. You can only view your own information." 
      });
    }

    const owner = await findOwnerById(id);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    res.status(200).json(owner);
  } catch (error) {
    console.error("Error fetching owner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📘 GET owner with their vehicles
export const getOwnerWithVehiclesController = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, owner_id: userOwnerId } = req.user;

    // For customers, only allow access to their own data
    if (role === 'customer' && parseInt(id) !== userOwnerId) {
      return res.status(403).json({ 
        message: "Access denied. You can only view your own information." 
      });
    }

    const ownerWithVehicles = await getOwnerWithVehicles(id);
    if (!ownerWithVehicles) {
      return res.status(404).json({ message: "Owner not found" });
    }

    res.status(200).json(ownerWithVehicles);
  } catch (error) {
    console.error("Error fetching owner with vehicles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🧾 CREATE new owner (admin only)
export const createOwnerController = async (req, res) => {
  try {
    const { name, contact } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({ message: "Owner name is required" });
    }

    if (name.trim().length === 0) {
      return res.status(400).json({ message: "Owner name cannot be empty" });
    }

    const newOwner = await createOwner(name.trim(), contact?.trim() || null);

    res.status(201).json({
      message: "Owner created successfully",
      owner: newOwner,
    });
  } catch (error) {
    console.error("Error creating owner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🧾 UPDATE owner by ID (admin only)
export const updateOwnerController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact } = req.body;

    // Check if owner exists
    const existingOwner = await findOwnerById(id);
    if (!existingOwner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Validation
    if (name !== undefined && (!name || name.trim().length === 0)) {
      return res.status(400).json({ message: "Owner name cannot be empty" });
    }

    const updatedOwner = await updateOwner(
      id, 
      name?.trim() || null, 
      contact?.trim() || null
    );

    res.status(200).json({
      message: "Owner updated successfully",
      owner: updatedOwner,
    });
  } catch (error) {
    console.error("Error updating owner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🗑️ DELETE owner by ID (admin only)
export const deleteOwnerController = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if owner exists
    const existingOwner = await findOwnerById(id);
    if (!existingOwner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    // Check if owner has vehicles
    const vehicles = await getVehiclesByOwnerId(id);
    if (vehicles.length > 0) {
      return res.status(400).json({ 
        message: "Cannot delete owner with associated vehicles. Please reassign or delete vehicles first.",
        vehicleCount: vehicles.length
      });
    }

    const deletedOwner = await deleteOwner(id);

    res.status(200).json({
      message: "Owner deleted successfully",
      owner: deletedOwner,
    });
  } catch (error) {
    console.error("Error deleting owner:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📘 GET vehicles for a specific owner
export const getOwnerVehicles = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, owner_id: userOwnerId } = req.user;

    // For customers, only allow access to their own vehicles
    if (role === 'customer' && parseInt(id) !== userOwnerId) {
      return res.status(403).json({ 
        message: "Access denied. You can only view your own vehicles." 
      });
    }

    // Check if owner exists
    const owner = await findOwnerById(id);
    if (!owner) {
      return res.status(404).json({ message: "Owner not found" });
    }

    const vehicles = await getVehiclesByOwnerId(id);
    
    res.status(200).json({
      owner_id: parseInt(id),
      owner_name: owner.name,
      vehicles: vehicles
    });
  } catch (error) {
    console.error("Error fetching owner vehicles:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};