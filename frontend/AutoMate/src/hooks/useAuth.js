import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Custom hook to check if user has specific role
 * @param {string|string[]} allowedRoles - Role or array of roles to check
 * @returns {boolean} Whether user has the required role
 */
export const useRole = (allowedRoles) => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) {
    return false;
  }
  
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(user.role);
};

/**
 * Custom hook to check if user is admin
 * @returns {boolean} Whether user is admin
 */
export const useIsAdmin = () => {
  return useRole('admin');
};

/**
 * Custom hook to check if user is mechanic
 * @returns {boolean} Whether user is mechanic
 */
export const useIsMechanic = () => {
  return useRole('mechanic');
};

/**
 * Custom hook to check if user is customer
 * @returns {boolean} Whether user is customer
 */
export const useIsCustomer = () => {
  return useRole('customer');
};

export default useAuth;