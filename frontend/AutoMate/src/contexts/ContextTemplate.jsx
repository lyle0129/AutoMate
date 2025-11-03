import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  // Define your initial state here
};

// Action types
const ActionTypes = {
  // Define your action types here
  // EXAMPLE_ACTION: 'EXAMPLE_ACTION',
};

// Reducer function
const contextReducer = (state, action) => {
  switch (action.type) {
    // Handle your actions here
    // case ActionTypes.EXAMPLE_ACTION:
    //   return { ...state, /* updated state */ };
    default:
      return state;
  }
};

// Create context
const TemplateContext = createContext();

/**
 * Context Provider Component
 * @param {Object} props - Provider props
 * @param {React.ReactNode} props.children - Child components
 */
export const TemplateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(contextReducer, initialState);

  // Context value
  const value = {
    ...state,
    dispatch,
    // Add your custom methods here
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};

/**
 * Custom hook to use the context
 * @returns {Object} Context value
 */
export const useTemplate = () => {
  const context = useContext(TemplateContext);
  
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  
  return context;
};

export default TemplateContext;