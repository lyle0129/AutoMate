import {
    createMaintenanceLog,
    findMaintenanceLogById,
    getAllMaintenanceLogs,
    getMaintenanceLogsByOwnerId,
    getMaintenanceLogsByVehicleId,
    getMaintenanceLogsByMechanic,
    updateMaintenanceLog,
    deleteMaintenanceLog,
    validateVehicleAndGetOwner,
    getMaintenanceHistorySummary,
    getServicesForVehicleType,
    validateServicesForVehicle,
    markMaintenanceLogAsPaid,
    markMaintenanceLogAsUnpaid,
    updatePaymentMethod,
    getUnpaidMaintenanceLogs,
    getUnpaidMaintenanceLogsByOwnerId,
    getPaidMaintenanceLogs,
    getPaidMaintenanceLogsByOwnerId,
    getPaymentSummaryByOwnerId,
    getOverallPaymentSummary,
    validatePaymentMethod
} from "../models/maintenanceLogModel.js";

// 📘 GET all maintenance logs with role-based filtering
export const getAllMaintenanceLogsController = async (req, res) => {
    try {
        const { role, owner_id, user_name } = req.user;

        let maintenanceLogs;

        if (role === 'customer') {
            // Customers can only see their own maintenance logs
            maintenanceLogs = await getMaintenanceLogsByOwnerId(owner_id);
        } else if (role === 'mechanic') {
            // Mechanics can see all maintenance logs (for shop operations)
            maintenanceLogs = await getAllMaintenanceLogs();
        } else {
            // Admin can see all maintenance logs
            maintenanceLogs = await getAllMaintenanceLogs();
        }

        res.status(200).json(maintenanceLogs);
    } catch (error) {
        console.error("Error fetching maintenance logs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📘 GET single maintenance log by ID with role-based filtering
export const getMaintenanceLogByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, owner_id } = req.user;

        const maintenanceLog = await findMaintenanceLogById(id);
        if (!maintenanceLog) {
            return res.status(404).json({ message: "Maintenance log not found" });
        }

        // For customers, only allow access to their own maintenance logs
        if (role === 'customer' && maintenanceLog.owner_id !== owner_id) {
            return res.status(403).json({
                message: "Access denied. You can only view your own maintenance records."
            });
        }

        res.status(200).json(maintenanceLog);
    } catch (error) {
        console.error("Error fetching maintenance log:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📘 GET maintenance logs by vehicle ID with role-based filtering
export const getMaintenanceLogsByVehicleIdController = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { role, owner_id } = req.user;

        // First validate the vehicle exists and get its owner
        const vehicle = await validateVehicleAndGetOwner(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // For customers, only allow access to their own vehicles
        if (role === 'customer' && vehicle.owner_id !== owner_id) {
            return res.status(403).json({
                message: "Access denied. You can only view maintenance records for your own vehicles."
            });
        }

        const maintenanceLogs = await getMaintenanceLogsByVehicleId(vehicleId);

        res.status(200).json({
            vehicle: vehicle,
            maintenance_logs: maintenanceLogs
        });
    } catch (error) {
        console.error("Error fetching maintenance logs by vehicle:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📘 GET maintenance logs by mechanic (admin and mechanic only)
export const getMaintenanceLogsByMechanicController = async (req, res) => {
    try {
        const { mechanicName } = req.params;
        const { role, user_name } = req.user;

        // Mechanics can only see their own logs, admin can see any mechanic's logs
        if (role === 'mechanic' && mechanicName !== user_name) {
            return res.status(403).json({
                message: "Access denied. You can only view your own maintenance records."
            });
        }

        const maintenanceLogs = await getMaintenanceLogsByMechanic(mechanicName);

        res.status(200).json({
            mechanic: mechanicName,
            maintenance_logs: maintenanceLogs
        });
    } catch (error) {
        console.error("Error fetching maintenance logs by mechanic:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🧾 CREATE new maintenance log with service integration (mechanic and admin only)
export const createMaintenanceLogController = async (req, res) => {
    try {
        const { vehicle_id, cost, description, service_ids } = req.body;
        const { user_name } = req.user;

        // Validation
        if (!vehicle_id) {
            return res.status(400).json({ message: "Vehicle ID is required" });
        }

        if (!user_name) {
            return res.status(400).json({ message: "User name is required" });
        }

        // Validate vehicle exists
        const vehicle = await validateVehicleAndGetOwner(vehicle_id);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // Validate cost if provided
        if (cost !== undefined && cost !== null) {
            const numCost = parseFloat(cost);
            if (isNaN(numCost) || numCost < 0) {
                return res.status(400).json({ message: "Cost must be a valid positive number" });
            }
        }

        // Validate service_ids if provided
        if (service_ids && service_ids.length > 0) {
            if (!Array.isArray(service_ids)) {
                return res.status(400).json({ message: "Service IDs must be an array" });
            }

            // Validate service compatibility
            const validation = await validateServicesForVehicle(vehicle_id, service_ids);
            if (!validation.compatible) {
                return res.status(400).json({
                    message: "Some services are not compatible with this vehicle type",
                    incompatible_services: validation.incompatible_services,
                    vehicle_type: validation.vehicle_type
                });
            }
        }

        const newMaintenanceLog = await createMaintenanceLog(
            vehicle_id,
            cost || null,
            description || null,
            user_name,
            service_ids || []
        );

        res.status(201).json({
            message: "Maintenance log created successfully",
            maintenance_log: newMaintenanceLog,
        });
    } catch (error) {
        console.error("Error creating maintenance log:", error);
        if (error.message === "Vehicle not found") {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        if (error.message.includes("not compatible")) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🧾 UPDATE maintenance log by ID (admin only)
export const updateMaintenanceLogController = async (req, res) => {
    try {
        const { id } = req.params;
        const { cost, description } = req.body;

        // Check if maintenance log exists
        const existingLog = await findMaintenanceLogById(id);
        if (!existingLog) {
            return res.status(404).json({ message: "Maintenance log not found" });
        }

        // Validate cost if provided
        if (cost !== undefined && cost !== null) {
            const numCost = parseFloat(cost);
            if (isNaN(numCost) || numCost < 0) {
                return res.status(400).json({ message: "Cost must be a valid positive number" });
            }
        }

        const updatedLog = await updateMaintenanceLog(
            id,
            cost || null,
            description || null
        );

        res.status(200).json({
            message: "Maintenance log updated successfully",
            maintenance_log: updatedLog,
        });
    } catch (error) {
        console.error("Error updating maintenance log:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🗑️ DELETE maintenance log by ID (admin only)
export const deleteMaintenanceLogController = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if maintenance log exists
        const existingLog = await findMaintenanceLogById(id);
        if (!existingLog) {
            return res.status(404).json({ message: "Maintenance log not found" });
        }

        const deletedLog = await deleteMaintenanceLog(id);

        res.status(200).json({
            message: "Maintenance log deleted successfully",
            maintenance_log: deletedLog,
        });
    } catch (error) {
        console.error("Error deleting maintenance log:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📘 GET maintenance history summary for a vehicle
export const getMaintenanceHistorySummaryController = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { role, owner_id } = req.user;

        // First validate the vehicle exists and get its owner
        const vehicle = await validateVehicleAndGetOwner(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // For customers, only allow access to their own vehicles
        if (role === 'customer' && vehicle.owner_id !== owner_id) {
            return res.status(403).json({
                message: "Access denied. You can only view maintenance records for your own vehicles."
            });
        }

        const summary = await getMaintenanceHistorySummary(vehicleId);

        res.status(200).json({
            vehicle: vehicle,
            maintenance_summary: {
                ...summary,
                total_services: parseInt(summary.total_services),
                total_cost: parseFloat(summary.total_cost)
            }
        });
    } catch (error) {
        console.error("Error fetching maintenance history summary:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📘 GET available services for a vehicle (all roles)
export const getAvailableServicesForVehicleController = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { role, owner_id } = req.user;

        // First validate the vehicle exists and get its owner
        const vehicle = await validateVehicleAndGetOwner(vehicleId);
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }

        // For customers, only allow access to their own vehicles
        if (role === 'customer' && vehicle.owner_id !== owner_id) {
            return res.status(403).json({
                message: "Access denied. You can only view services for your own vehicles."
            });
        }

        const services = await getServicesForVehicleType(vehicle.vehicle_type);

        res.status(200).json({
            vehicle: {
                vehicle_id: vehicle.vehicle_id,
                plate_no: vehicle.plate_no,
                make: vehicle.make,
                model: vehicle.model,
                vehicle_type: vehicle.vehicle_type
            },
            available_services: services
        });
    } catch (error) {
        console.error("Error fetching available services for vehicle:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// PAYMENT TRACKING CONTROLLERS

// 🧾 MARK maintenance log as paid (admin and mechanic only)
export const markMaintenanceLogAsPaidController = async (req, res) => {
    try {
        const { id } = req.params;
        const { paid_using } = req.body;

        // Validation
        if (!paid_using) {
            return res.status(400).json({ message: "Payment method (paid_using) is required" });
        }

        if (!validatePaymentMethod(paid_using)) {
            return res.status(400).json({
                message: "Invalid payment method. Valid methods: cash, card, bank_transfer, check, mobile_payment, other"
            });
        }

        // Check if maintenance log exists
        const existingLog = await findMaintenanceLogById(id);
        if (!existingLog) {
            return res.status(404).json({ message: "Maintenance log not found" });
        }

        // Check if already paid
        if (existingLog.paid_at) {
            return res.status(400).json({
                message: "Maintenance log is already marked as paid",
                paid_at: existingLog.paid_at,
                paid_using: existingLog.paid_using
            });
        }

        const updatedLog = await markMaintenanceLogAsPaid(id, paid_using.toLowerCase());

        res.status(200).json({
            message: "Maintenance log marked as paid successfully",
            maintenance_log: updatedLog,
        });
    } catch (error) {
        console.error("Error marking maintenance log as paid:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🧾 MARK maintenance log as unpaid (admin only)
export const markMaintenanceLogAsUnpaidController = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if maintenance log exists
        const existingLog = await findMaintenanceLogById(id);
        if (!existingLog) {
            return res.status(404).json({ message: "Maintenance log not found" });
        }

        // Check if already unpaid
        if (!existingLog.paid_at) {
            return res.status(400).json({
                message: "Maintenance log is already marked as unpaid"
            });
        }

        const updatedLog = await markMaintenanceLogAsUnpaid(id);

        res.status(200).json({
            message: "Maintenance log marked as unpaid successfully",
            maintenance_log: updatedLog,
        });
    } catch (error) {
        console.error("Error marking maintenance log as unpaid:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 🧾 UPDATE payment method (admin and mechanic only)
export const updatePaymentMethodController = async (req, res) => {
    try {
        const { id } = req.params;
        const { paid_using } = req.body;

        // Validation
        if (!paid_using) {
            return res.status(400).json({ message: "Payment method (paid_using) is required" });
        }

        if (!validatePaymentMethod(paid_using)) {
            return res.status(400).json({
                message: "Invalid payment method. Valid methods: cash, card, bank_transfer, check, mobile_payment, other"
            });
        }

        // Check if maintenance log exists
        const existingLog = await findMaintenanceLogById(id);
        if (!existingLog) {
            return res.status(404).json({ message: "Maintenance log not found" });
        }

        // Check if log is paid
        if (!existingLog.paid_at) {
            return res.status(400).json({
                message: "Cannot update payment method for unpaid maintenance log. Mark as paid first."
            });
        }

        const updatedLog = await updatePaymentMethod(id, paid_using.toLowerCase());

        if (!updatedLog) {
            return res.status(400).json({ message: "Failed to update payment method" });
        }

        res.status(200).json({
            message: "Payment method updated successfully",
            maintenance_log: updatedLog,
        });
    } catch (error) {
        console.error("Error updating payment method:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📘 GET unpaid maintenance logs with role-based filtering
export const getUnpaidMaintenanceLogsController = async (req, res) => {
    try {
        const { role, owner_id } = req.user;

        let unpaidLogs;

        if (role === 'customer') {
            // Customers can only see their own unpaid maintenance logs
            unpaidLogs = await getUnpaidMaintenanceLogsByOwnerId(owner_id);
        } else {
            // Admin and mechanic can see all unpaid maintenance logs
            unpaidLogs = await getUnpaidMaintenanceLogs();
        }

        res.status(200).json({
            unpaid_maintenance_logs: unpaidLogs,
            count: unpaidLogs.length
        });
    } catch (error) {
        console.error("Error fetching unpaid maintenance logs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📘 GET paid maintenance logs with role-based filtering
export const getPaidMaintenanceLogsController = async (req, res) => {
    try {
        const { role, owner_id } = req.user;

        let paidLogs;

        if (role === 'customer') {
            // Customers can only see their own paid maintenance logs
            paidLogs = await getPaidMaintenanceLogsByOwnerId(owner_id);
        } else {
            // Admin and mechanic can see all paid maintenance logs
            paidLogs = await getPaidMaintenanceLogs();
        }

        res.status(200).json({
            paid_maintenance_logs: paidLogs,
            count: paidLogs.length
        });
    } catch (error) {
        console.error("Error fetching paid maintenance logs:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// 📘 GET payment summary with role-based filtering
export const getPaymentSummaryController = async (req, res) => {
    try {
        const { role, owner_id } = req.user;

        let paymentSummary;

        if (role === 'customer') {
            // Customers can only see their own payment summary
            paymentSummary = await getPaymentSummaryByOwnerId(owner_id);
        } else {
            // Admin can see overall payment summary, mechanic can see overall summary too
            paymentSummary = await getOverallPaymentSummary();
        }

        res.status(200).json({
            payment_summary: {
                ...paymentSummary,
                total_logs: parseInt(paymentSummary.total_logs),
                paid_logs: parseInt(paymentSummary.paid_logs),
                unpaid_logs: parseInt(paymentSummary.unpaid_logs),
                total_paid_amount: parseFloat(paymentSummary.total_paid_amount),
                total_unpaid_amount: parseFloat(paymentSummary.total_unpaid_amount),
                total_amount: parseFloat(paymentSummary.total_amount)
            }
        });
    } catch (error) {
        console.error("Error fetching payment summary:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};