import express from "express";
import {
  getAllMaintenanceLogsController,
  getMaintenanceLogByIdController,
  getMaintenanceLogsByVehicleIdController,
  getMaintenanceLogsByMechanicController,
  createMaintenanceLogController,
  updateMaintenanceLogController,
  deleteMaintenanceLogController,
  getMaintenanceHistorySummaryController,
  getAvailableServicesForVehicleController,
  markMaintenanceLogAsPaidController,
  markMaintenanceLogAsUnpaidController,
  updatePaymentMethodController,
  getUnpaidMaintenanceLogsController,
  getPaidMaintenanceLogsController,
  getPaymentSummaryController
} from "../controllers/maintenanceLogController.js";
import { verifyToken, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Routes with role-based access control

// GET all maintenance logs - all roles with filtering
router.get("/", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getAllMaintenanceLogsController
);

// GET single maintenance log by ID - all roles with filtering
router.get("/:id", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getMaintenanceLogByIdController
);

// GET maintenance logs by vehicle ID - all roles with filtering
router.get("/vehicle/:vehicleId", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getMaintenanceLogsByVehicleIdController
);

// GET maintenance history summary for a vehicle - all roles with filtering
router.get("/vehicle/:vehicleId/summary", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getMaintenanceHistorySummaryController
);

// GET available services for a vehicle - all roles with filtering
router.get("/vehicle/:vehicleId/services", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getAvailableServicesForVehicleController
);

// GET maintenance logs by mechanic - admin and mechanic only
router.get("/mechanic/:mechanicName", 
  verifyToken, 
  authorizeRoles("admin", "mechanic"), 
  getMaintenanceLogsByMechanicController
);

// CREATE new maintenance log - mechanic and admin only
router.post("/", 
  verifyToken, 
  authorizeRoles("admin", "mechanic"), 
  createMaintenanceLogController
);

// UPDATE maintenance log by ID - admin only
router.put("/:id", 
  verifyToken, 
  authorizeRoles("admin"), 
  updateMaintenanceLogController
);

// DELETE maintenance log by ID - admin only
router.delete("/:id", 
  verifyToken, 
  authorizeRoles("admin"), 
  deleteMaintenanceLogController
);

// PAYMENT TRACKING ROUTES

// GET unpaid maintenance logs - all roles with filtering
router.get("/payment/unpaid", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getUnpaidMaintenanceLogsController
);

// GET paid maintenance logs - all roles with filtering
router.get("/payment/paid", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getPaidMaintenanceLogsController
);

// GET payment summary - all roles with filtering
router.get("/payment/summary", 
  verifyToken, 
  authorizeRoles("admin", "mechanic", "customer"), 
  getPaymentSummaryController
);

// MARK maintenance log as paid - admin and mechanic only
router.patch("/:id/pay", 
  verifyToken, 
  authorizeRoles("admin", "mechanic"), 
  markMaintenanceLogAsPaidController
);

// MARK maintenance log as unpaid - admin only
router.patch("/:id/unpay", 
  verifyToken, 
  authorizeRoles("admin"), 
  markMaintenanceLogAsUnpaidController
);

// UPDATE payment method - admin and mechanic only
router.patch("/:id/payment-method", 
  verifyToken, 
  authorizeRoles("admin", "mechanic"), 
  updatePaymentMethodController
);

export default router;