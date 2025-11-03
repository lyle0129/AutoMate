import {
  createService,
  findServiceById,
  getAllServices,
  updateService,
  deleteService,
  getServicesByVehicleType,
  isServiceCompatible,
  findServiceByName,
  validateServicePrice,
  validateVehicleTypes
} from "../models/serviceModel.js";

// 📘 GET all services (all roles can read)
export const getAllServicesController = async (req, res) => {
  try {
    const services = await getAllServices();
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📘 GET single service by ID (all roles can read)
export const getServiceByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await findServiceById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📘 GET services by vehicle type compatibility
export const getServicesByVehicleTypeController = async (req, res) => {
  try {
    const { vehicle_type } = req.query;

    if (!vehicle_type) {
      return res.status(400).json({ message: "Vehicle type is required" });
    }

    const services = await getServicesByVehicleType(vehicle_type);
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services by vehicle type:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🧾 CREATE new service (admin only)
export const createServiceController = async (req, res) => {
  try {
    const { service_name, price, vehicle_types = [] } = req.body;

    // Validation - service name is required
    if (!service_name) {
      return res.status(400).json({ message: "Service name is required" });
    }

    if (service_name.trim().length === 0) {
      return res.status(400).json({ message: "Service name cannot be empty" });
    }

    // Validation - price is required and must be positive
    if (!price) {
      return res.status(400).json({ message: "Service price is required" });
    }

    if (!validateServicePrice(price)) {
      return res.status(400).json({ message: "Service price must be a positive number" });
    }

    // Validation - vehicle types array
    if (!validateVehicleTypes(vehicle_types)) {
      return res.status(400).json({ 
        message: "Vehicle types must be an array of non-empty strings" 
      });
    }

    // Check for unique service name
    const existingService = await findServiceByName(service_name.trim());
    if (existingService) {
      return res.status(409).json({ 
        message: "Service name already exists. Service names must be unique." 
      });
    }

    const newService = await createService(
      service_name.trim(), 
      parseFloat(price), 
      vehicle_types.map(type => type.trim())
    );

    res.status(201).json({
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🧾 UPDATE service by ID (admin only)
export const updateServiceController = async (req, res) => {
  try {
    const { id } = req.params;
    const { service_name, price, vehicle_types } = req.body;

    // Check if service exists
    const existingService = await findServiceById(id);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    // Validation - service name if provided
    if (service_name !== undefined) {
      if (!service_name || service_name.trim().length === 0) {
        return res.status(400).json({ message: "Service name cannot be empty" });
      }

      // Check for unique service name (excluding current service)
      const serviceWithSameName = await findServiceByName(service_name.trim());
      if (serviceWithSameName && serviceWithSameName.service_id !== parseInt(id)) {
        return res.status(409).json({ 
          message: "Service name already exists. Service names must be unique." 
        });
      }
    }

    // Validation - price if provided
    if (price !== undefined && !validateServicePrice(price)) {
      return res.status(400).json({ message: "Service price must be a positive number" });
    }

    // Validation - vehicle types if provided
    if (vehicle_types !== undefined && !validateVehicleTypes(vehicle_types)) {
      return res.status(400).json({ 
        message: "Vehicle types must be an array of non-empty strings" 
      });
    }

    const updatedService = await updateService(
      id,
      service_name?.trim() || null,
      price ? parseFloat(price) : null,
      vehicle_types ? vehicle_types.map(type => type.trim()) : null
    );

    res.status(200).json({
      message: "Service updated successfully",
      service: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 🗑️ DELETE service by ID (admin only)
export const deleteServiceController = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const existingService = await findServiceById(id);
    if (!existingService) {
      return res.status(404).json({ message: "Service not found" });
    }

    const deletedService = await deleteService(id);

    res.status(200).json({
      message: "Service deleted successfully",
      service: deletedService,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 📘 CHECK service compatibility with vehicle type
export const checkServiceCompatibilityController = async (req, res) => {
  try {
    const { id } = req.params;
    const { vehicle_type } = req.query;

    if (!vehicle_type) {
      return res.status(400).json({ message: "Vehicle type is required" });
    }

    // Check if service exists
    const service = await findServiceById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const isCompatible = await isServiceCompatible(id, vehicle_type);

    res.status(200).json({
      service_id: parseInt(id),
      service_name: service.service_name,
      vehicle_type: vehicle_type,
      is_compatible: isCompatible
    });
  } catch (error) {
    console.error("Error checking service compatibility:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};