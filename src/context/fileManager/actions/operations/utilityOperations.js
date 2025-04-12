/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Utility operations for file manager
 *
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @return {Object} Utility operations
 */
export const useUtilityOperations = (state, setState) => {
  /**
   * Set state helper function
   *
   * @param {Object} newState New state to set
   */
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    updateState({
      error: null,
      successMessage: null
    });
  }, []);

  /**
   * Clear upload error
   */
  const clearUploadError = useCallback(() => {
    updateState({ uploadError: null });
  }, []);

  return {
    updateState,
    clearMessages,
    clearUploadError
  };
};
