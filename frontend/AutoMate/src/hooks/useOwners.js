import { useState, useCallback } from 'react';
import ownerService from '../services/ownerService';
import { ApiError } from '../services/apiClient';

/**
 * Custom hook for managing owner data
 */
export const useOwners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOwners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownerService.getAllOwners();
      setOwners(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch owners');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const getOwnerById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownerService.getOwnerById(id);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch owner');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOwnerWithVehicles = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownerService.getOwnerWithVehicles(id);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch owner with vehicles');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOwner = useCallback(async (ownerData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownerService.createOwner(ownerData);
      setOwners(prev => [...prev, data.owner]);
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create owner');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOwner = useCallback(async (id, ownerData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await ownerService.updateOwner(id, ownerData);
      setOwners(prev => prev.map(o => o.owner_id === id ? data.owner : o));
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update owner');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOwner = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await ownerService.deleteOwner(id);
      setOwners(prev => prev.filter(o => o.owner_id !== id));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete owner');
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
    owners,
    loading,
    error,
    fetchOwners,
    getOwnerById,
    getOwnerWithVehicles,
    createOwner,
    updateOwner,
    deleteOwner,
    clearError
  };
};

export default useOwners;