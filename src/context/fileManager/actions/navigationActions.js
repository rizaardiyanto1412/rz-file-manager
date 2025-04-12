/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Hook for navigation actions
 * 
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @return {Object} Navigation actions
 */
export const useNavigationActions = (state, setState) => {
  /**
   * Set state helper function
   * 
   * @param {Object} newState New state to set
   */
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  /**
   * Navigate to a directory
   * 
   * @param {string} path Directory path
   */
  const navigateTo = useCallback((path) => {
    updateState({
      currentPath: path,
      selectedItems: []
    });
  }, []);

  /**
   * Navigate to parent directory
   */
  const navigateToParent = useCallback(() => {
    const { currentPath } = state;
    if (!currentPath) return;
    
    const parts = currentPath.split('/');
    parts.pop();
    const parentPath = parts.join('/');
    
    navigateTo(parentPath);
  }, [state.currentPath]);

  return {
    navigateTo,
    navigateToParent
  };
};
