import express from "express";
import {
  getAllServicesController,
  getServiceByIdController,
  getServicesByVehicleTypeController,
  createServiceController,
  updateServiceController,
  deleteServiceController,
  checkServiceCompatibilityController
} from "../controllers/serviceController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes with role-based access control

// GET all services - all roles can read
router.get("/", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getAllServicesController
);

// GET single service by ID - all roles can read
router.get("/:id", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getServiceByIdController
);

// GET services by vehicle type - all roles can read
router.get("/filter/by-vehicle-type", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getServicesByVehicleTypeController
);

// CHECK service compatibility with vehicle type - all roles can read
router.get("/:id/compatibility", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  checkServiceCompatibilityController
);

// CREATE new service - admin only
router.post("/", 
  verifyToken, 
  authorizeRoles("admin"), 
  createServiceController
);

// UPDATE service by ID - admin only
router.put("/:id", 
  verifyToken, 
  authorizeRoles("admin"), 
  updateServiceController
);

// DELETE service by ID - admin only
router.delete("/:id", 
  verifyToken, 
  authorizeRoles("admin"), 
  deleteServiceController
);

export default router;