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
        setItems(response.items);
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
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
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
  }, [currentPath]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
