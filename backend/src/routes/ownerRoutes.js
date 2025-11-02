import express from "express";
import {
  getAllOwnersController,
  getOwnerById,
  getOwnerWithVehiclesController,
  createOwnerController,
  updateOwnerController,
  deleteOwnerController,
  getOwnerVehicles
} from "../controllers/ownerController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes with role-based access control

// GET all owners - admin and mechanic only
router.get("/", 
  verifyToken, 
  authorizeRoles("admin", "mechanic"), 
  getAllOwnersController
);

// GET single owner by ID - all roles with filtering
router.get("/:id", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getOwnerById
);

// GET owner with vehicles - all roles with filtering
router.get("/:id/details", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getOwnerWithVehiclesController
);

// GET vehicles for specific owner - all roles with filtering
router.get("/:id/vehicles", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getOwnerVehicles
);

// CREATE new owner - admin only
router.post("/", 
  verifyToken, 
  authorizeRoles("admin"), 
  createOwnerController
);

// UPDATE owner by ID - admin only
router.put("/:id", 
  verifyToken, 
  authorizeRoles("admin"), 
  updateOwnerController
);

// DELETE owner by ID - admin only
router.delete("/:id", 
  verifyToken, 
  authorizeRoles("admin"), 
  deleteOwnerController
);

export default router;