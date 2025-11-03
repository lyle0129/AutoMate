import express from "express";
import {
  getAllVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../controllers/vehicleController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes
router.get("/", verifyToken, authorizeRoles("admin", "mechanic", "customer"), getAllVehicles);
router.get("/:id", verifyToken, authorizeRoles("admin", "mechanic", "customer"), getVehicleById);
router.post("/", verifyToken, authorizeRoles("admin"), createVehicle);
router.put("/:id", verifyToken, authorizeRoles("admin"), updateVehicle);
router.delete("/:id", verifyToken, authorizeRoles("admin"), deleteVehicle);

export default router;
