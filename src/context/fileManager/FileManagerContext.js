/**
 * WordPress dependencies
 */
import { createContext, useState, useEffect, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { initialState } from './state/initialState';
import { useFileOperations } from './actions/fileOperations';
import { useNavigationActions } from './actions/navigationActions';
import { useSelectionActions } from './actions/selectionActions';
import { useModalActions } from './actions/modalActions';
import { useClipboardActions } from './actions/clipboardActions';
import { useSortingActions } from './actions/sortingActions';
import { useZipActions } from './actions/zipActions';

// Create context
const FileManagerContext = createContext();

/**
 * FileManagerProvider component
 * 
 * This component provides state management for the file manager.
 * It handles all the state related to files, folders, and operations.
 * 
 * @param {Object} props Component props
 * @param {JSX.Element} props.children Child components
 * @return {JSX.Element} The context provider
 */
export const FileManagerProvider = ({ children }) => {
  // Initialize state with initial values
  const [state, setState] = useState(initialState);

  // Get actions from hooks
  const fileOperations = useFileOperations(state, setState);
  const navigationActions = useNavigationActions(state, setState);
  const selectionActions = useSelectionActions(state, setState);
  const modalActions = useModalActions(state, setState);
  const clipboardActions = useClipboardActions(state, setState, fileOperations.loadItems);
  const sortingActions = useSortingActions(state, setState);
  const zipActions = useZipActions(state, setState, fileOperations.loadItems);

  // Initial load
  useEffect(() => {
    fileOperations.loadItems();
  }, [state.currentPath]); // Reload when path changes

  // Clear success message after 3 seconds
  useEffect(() => {
    if (state.successMessage) {
      const timer = setTimeout(() => {
        setState(prevState => ({ ...prevState, successMessage: null }));
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [state.successMessage]);

  // Load items when current path, sort key, or sort direction changes
  useEffect(() => {
    fileOperations.loadItems();
  }, [state.currentPath, state.sortKey, state.sortDirection]);

  // Memoized context value
  const value = useMemo(() => ({
    // State
    ...state,
    
    // File operations
    ...fileOperations,
    
    // Navigation
    ...navigationActions,
    
    // Selection
    ...selectionActions,
    
    // Modal actions
    ...modalActions,
    
    // Clipboard actions
    ...clipboardActions,
    
    // Sorting actions
    ...sortingActions,
    
    // Zip actions
    ...zipActions,
    
    // Derived state
    areAllItemsSelected: state.items.length > 0 && state.selectedItems.length === state.items.length,
  }), [
    state,
    fileOperations,
    navigationActions,
    selectionActions,
    modalActions,
    clipboardActions,
    sortingActions,
    zipActions
  ]);

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
};

export default FileManagerContext;
