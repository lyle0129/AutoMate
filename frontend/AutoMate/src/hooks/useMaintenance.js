import { useState, useCallback } from 'react';
import maintenanceService from '../services/maintenanceService';
import { ApiError } from '../services/apiClient';

/**
 * Custom hook for managing maintenance data
 */
export const useMaintenance = () => {
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMaintenanceLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getAllMaintenanceLogs();
      setMaintenanceLogs(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch maintenance logs');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMaintenanceLogById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getMaintenanceLogById(id);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch maintenance log');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMaintenanceLogsByVehicleId = useCallback(async (vehicleId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getMaintenanceLogsByVehicleId(vehicleId);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch vehicle maintenance logs');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMaintenanceHistorySummary = useCallback(async (vehicleId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getMaintenanceHistorySummary(vehicleId);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch maintenance summary');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnpaidMaintenanceLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getUnpaidMaintenanceLogs();
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch unpaid maintenance logs');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaidMaintenanceLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getPaidMaintenanceLogs();
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch paid maintenance logs');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPaymentSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.getPaymentSummary();
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch payment summary');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMaintenanceLog = useCallback(async (logData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.createMaintenanceLog(logData);
      setMaintenanceLogs(prev => [...prev, data.maintenance_log]);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create maintenance log');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsPaid = useCallback(async (id, paymentMethod) => {
    setLoading(true);
    setError(null);
    try {
      const data = await maintenanceService.markAsPaid(id, paymentMethod);
      // Update the maintenance log in the local state
      setMaintenanceLogs(prev => prev.map(log => 
        log.log_id === parseInt(id) 
          ? { ...log, paid_at: new Date().toISOString(), paid_using: paymentMethod }
          : log
      ));
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to mark maintenance log as paid');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    maintenanceLogs,
    loading,
    error,
    fetchMaintenanceLogs,
    getMaintenanceLogById,
    getMaintenanceLogsByVehicleId,
    getMaintenanceHistorySummary,
    getUnpaidMaintenanceLogs,
    getPaidMaintenanceLogs,
    getPaymentSummary,
    createMaintenanceLog,
    markAsPaid,
    clearError
  };
};

export default useMaintenance;