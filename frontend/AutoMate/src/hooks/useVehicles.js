import { useState, useCallback } from 'react';
import vehicleService from '../services/vehicleService';
import { ApiError } from '../services/apiClient';

/**
 * Custom hook for managing vehicle data
 */
export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getAllVehicles();
      setVehicles(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch vehicles');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getVehicleById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.getVehicleById(id);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch vehicle');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createVehicle = useCallback(async (vehicleData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.createVehicle(vehicleData);
      setVehicles(prev => [...prev, data.vehicle]);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create vehicle');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateVehicle = useCallback(async (id, vehicleData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleService.updateVehicle(id, vehicleData);
      setVehicles(prev => prev.map(v => v.vehicle_id === id ? data.vehicle : v));
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update vehicle');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await vehicleService.deleteVehicle(id);
      setVehicles(prev => prev.filter(v => v.vehicle_id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete vehicle');
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
    vehicles,
    loading,
    error,
    fetchVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle,
    clearError
  };
};

export default useVehicles;