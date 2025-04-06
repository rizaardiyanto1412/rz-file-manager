/**
 * WordPress dependencies
 */
import { createContext, useState, useContext, useEffect, useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { fetchFiles, createFolder, uploadFile, deleteItem, renameItem, copyItem, moveItem } from '../services/api';

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
  // State for current path
  const [currentPath, setCurrentPath] = useState('');
  
  // State for files and folders
  const [items, setItems] = useState([]);
  
  // State for selected items
  const [selectedItems, setSelectedItems] = useState([]);
  
  // State for loading status
  const [loading, setLoading] = useState(false);
  
  // State for error messages
  const [error, setError] = useState(null);
  
  // State for success messages
  const [successMessage, setSuccessMessage] = useState(null);

  // State for sorting
  const [sortKey, setSortKey] = useState('name'); // Default sort by name
  const [sortDirection, setSortDirection] = useState('asc'); // Default ascending

  // State for context menu
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    item: null 
  });

  /**
   * Load files and folders for the current path
   */
  const loadItems = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetchFiles(currentPath);
      if (response.success) {
        const sortedData = sortItems(response.items, sortKey, sortDirection);
        setItems(sortedData);
      } else {
        setError(response.message || 'Failed to load files');
      }
    } catch (err) {
      setError('Error loading files: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sort items based on key and direction
   * Folders always come before files
   * @param {Array} itemsToSort Items to sort
   * @param {string} key Sort key ('name', 'size', 'modified')
   * @param {string} direction Sort direction ('asc', 'desc')
   * @return {Array} Sorted items
   */
  const sortItems = (itemsToSort, key, direction) => {
    return [...itemsToSort].sort((a, b) => {
      // Always sort directories before files
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;

      let comparison = 0;
      if (key === 'name') {
        comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      } else if (key === 'size') {
        // Treat directories as having size -1 for sorting purposes if needed,
        // but the primary directory check handles most cases.
        const sizeA = a.type === 'directory' ? -1 : a.size;
        const sizeB = b.type === 'directory' ? -1 : b.size;
        comparison = sizeA - sizeB;
      } else if (key === 'modified') {
        comparison = a.modified - b.modified;
      }

      return direction === 'asc' ? comparison : comparison * -1;
    });
  };

  /**
   * Create a new folder
   * 
   * @param {string} name Folder name
   */
  const handleCreateFolder = async (name) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createFolder(currentPath, name);
      if (response.success) {
        setSuccessMessage(response.message || 'Folder created successfully');
        // Reload items to show the new folder
        await loadItems();
      } else {
        setError(response.message || 'Failed to create folder');
      }
    } catch (err) {
      setError('Error creating folder: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Upload files
   * 
   * @param {FileList} files Files to upload
   */
  const handleUploadFiles = async (files) => {
    setLoading(true);
    setError(null);
    
    try {
      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await uploadFile(currentPath, file);
        
        if (!response.success) {
          setError(`Failed to upload ${file.name}: ${response.message || 'Unknown error'}`);
          break;
        }
      }
      
      setSuccessMessage('Files uploaded successfully');
      // Reload items to show the new files
      await loadItems();
    } catch (err) {
      setError('Error uploading files: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete selected items
   */
  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Delete each selected item
      for (const item of selectedItems) {
        const response = await deleteItem(item.path);
        
        if (!response.success) {
          setError(`Failed to delete ${item.name}: ${response.message || 'Unknown error'}`);
          break;
        }
      }
      
      setSuccessMessage('Items deleted successfully');
      // Clear selection and reload items
      setSelectedItems([]);
      await loadItems();
    } catch (err) {
      setError('Error deleting items: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Rename an item
   * 
   * @param {string} path Item path
   * @param {string} newName New name
   */
  const handleRenameItem = async (path, newName) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await renameItem(path, newName);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Item renamed successfully');
        // Reload items to show the renamed item
        await loadItems();
      } else {
        setError(response.message || 'Failed to rename item');
      }
    } catch (err) {
      setError('Error renaming item: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigate to a directory
   * 
   * @param {string} path Directory path
   */
  const navigateTo = (path) => {
    setCurrentPath(path);
    setSelectedItems([]);
  };

  /**
   * Navigate to parent directory
   */
  const navigateToParent = () => {
    if (!currentPath) return;
    
    const parts = currentPath.split('/');
    parts.pop();
    const parentPath = parts.join('/');
    
    navigateTo(parentPath);
  };

  /**
   * Toggle item selection
   * 
   * @param {Object} item Item to select/deselect
   */
  const toggleSelectItem = (item) => {
    setSelectedItems(prevSelected => {
      const isSelected = prevSelected.some(selected => selected.path === item.path);
      
      if (isSelected) {
        return prevSelected.filter(selected => selected.path !== item.path);
      } else {
        return [...prevSelected, item];
      }
    });
  };

  /**
   * Check if an item is selected
   * 
   * @param {Object} item Item to check
   * @return {boolean} True if item is selected
   */
  const isItemSelected = (item) => {
    return selectedItems.some(selected => selected.path === item.path);
  };

  /**
   * Clear selection
   */
  const clearSelection = () => {
    setSelectedItems([]);
  };

  /**
   * Clear messages
   */
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Function to show the context menu
  const showContextMenu = useCallback((item, event) => {
    event.preventDefault();
    // Use pageX/pageY for positioning relative to the document
    setContextMenu({
      visible: true,
      x: event.pageX, 
      y: event.pageY,
      item: item,
    });
  }, []);

  // Function to hide the context menu
  const hideContextMenu = useCallback(() => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false, item: null });
    }
  }, [contextMenu]);

  // Load items when current path changes
  useEffect(() => {
    loadItems();
  }, [currentPath, sortKey, sortDirection]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /**
   * Set the sort key and direction
   * @param {string} newKey The key to sort by ('name', 'size', 'modified')
   */
  const setSort = (newKey) => {
    const newDirection = (sortKey === newKey && sortDirection === 'asc') ? 'desc' : 'asc';
    setSortKey(newKey);
    setSortDirection(newDirection);
    // Re-sort existing items immediately
    setItems(prevItems => sortItems(prevItems, newKey, newDirection));
  };

  // Context value
  const value = {
    currentPath,
    items,
    selectedItems,
    loading,
    error,
    successMessage,
    navigateTo,
    navigateToParent,
    toggleSelectItem,
    isItemSelected,
    clearSelection,
    clearMessages,
    handleCreateFolder,
    handleUploadFiles,
    handleDeleteItems,
    handleRenameItem,
    reloadItems: loadItems,
    sortKey,
    sortDirection,
    setSort,
    contextMenu,
    showContextMenu,
    hideContextMenu,
  };

  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
};

/**
 * Custom hook to use the FileManagerContext
 * 
 * @return {Object} The context value
 */
export const useFileManager = () => useContext(FileManagerContext);

export default FileManagerContext;
