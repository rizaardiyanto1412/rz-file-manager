/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { sortItems } from '../utils/sortUtils';

/**
 * Hook for sorting actions
 * 
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @return {Object} Sorting actions
 */
export const useSortingActions = (state, setState) => {
  const { sortKey, sortDirection } = state;

  /**
   * Set state helper function
   * 
   * @param {Object} newState New state to set
   */
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  /**
   * Set sort key and direction
   * 
   * @param {string} newKey New sort key
   */
  const setSort = useCallback((newKey) => {
    const newDirection = (sortKey === newKey && sortDirection === 'asc') ? 'desc' : 'asc';
    
    // Re-sort existing items immediately
    const sortedItems = sortItems(state.items, newKey, newDirection);
    
    updateState({
      sortKey: newKey,
      sortDirection: newDirection,
      items: sortedItems
    });
  }, [state.items, sortKey, sortDirection]);

  return {
    setSort
  };
};
