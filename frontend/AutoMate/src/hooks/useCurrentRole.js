import { useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to determine the current user role from the URL path
 * This is useful for shared components that need to generate role-appropriate links
 */
export const useCurrentRole = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Extract role from current path
  const pathSegments = location.pathname.split('/');
  const roleFromPath = pathSegments[1]; // First segment after /
  
  // Validate that the role from path matches valid roles
  const validRoles = ['admin', 'mechanic', 'customer'];
  
  if (validRoles.includes(roleFromPath)) {
    return roleFromPath;
  }
  
  // Fallback to user role from auth context
  return user?.role || 'customer';
};