/**
 * WordPress dependencies
 */
import { createContext, useState, useContext, useEffect, useCallback, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { fetchFiles, createFolder, uploadFile, deleteItem, renameItem, copyItem, moveItem, getFileContent, saveFileContent } from '../services/api';

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

  // State for File Editor Modal
  const [editorState, setEditorState] = useState({
    isOpen: false,
    file: null,
    content: '',
    isLoading: false,
    error: null,
  });

  // State for Rename Modal
  const [renameModalState, setRenameModalState] = useState({
    isOpen: false,
    item: null,
  });

  // State for Create Folder Modal
  const [createFolderModalState, setCreateFolderModalState] = useState({ isOpen: false });

  // State for Delete Confirmation Modal
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false });

  // State for Upload Modal
  const [uploadModalState, setUploadModalState] = useState({ isOpen: false });

  // State for Upload Error
  const [uploadError, setUploadError] = useState(null);

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
    console.log('[Context] handleUploadFiles: Received files:', files); // Log input
    if (!files || files.length === 0) {
      console.log('[Context] handleUploadFiles: No files to upload.');
      setError('No files selected for upload.');
      setTimeout(() => setError(null), 3000);
      closeUploadModal(); // Close modal even if no files selected
      return;
    }

    setLoading(true);
    setError(null);
    setUploadError(null); // Clear previous errors on new upload attempt
    let overallSuccess = true; // Track overall success
    let finalMessage = '';

    try {
      console.log(`[Context] handleUploadFiles: Starting upload loop for ${files.length} files.`);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`[Context] handleUploadFiles: Uploading file ${i + 1}:`, file.name);
        const response = await uploadFile(currentPath, file);
        console.log(`[Context] handleUploadFiles: Response for ${file.name}:`, response); // Log response

        if (!response.success) {
          console.error(`[Context] handleUploadFiles: Failed to upload ${file.name}:`, response.message);
          setError(`Failed to upload ${file.name}: ${response.message || 'Unknown error'}`);
          setUploadError(response.message || 'An unknown error occurred.'); // Set the specific error message from the response
          overallSuccess = false; // Mark failure
          // Decide if you want to break or continue uploading others
          // break; // Uncomment to stop on first error
        } else {
          console.log(`[Context] handleUploadFiles: Successfully uploaded ${file.name}`);
        }
      }

      if (overallSuccess) {
        finalMessage = files.length > 1 ? 'Files uploaded successfully' : 'File uploaded successfully';
        console.log('[Context] handleUploadFiles: All uploads reported success.');
        setSuccessMessage(finalMessage);
      } else {
        // Error message was already set for the specific file(s)
        console.log('[Context] handleUploadFiles: One or more uploads failed.');
      }

      console.log('[Context] handleUploadFiles: Reloading items...');
      await loadItems(); // Reload items
      console.log('[Context] handleUploadFiles: Finished reloading items.');

    } catch (err) {
      console.error('[Context] handleUploadFiles: Error during upload process:', err); // Log caught error
      setError('Error uploading files: ' + (err.message || 'Unknown error'));
      setUploadError(err.message || 'A critical error occurred during upload.'); // Set error message from catch block
      overallSuccess = false; // Mark failure on catch
    } finally {
      setLoading(false);
      // Only close the modal automatically if ALL uploads were successful
      if (overallSuccess) {
        console.log('[Context] handleUploadFiles: All uploads successful. Closing modal.');
        closeUploadModal();
      } else {
        console.log('[Context] handleUploadFiles: Upload failed. Keeping modal open to show error.');
        // The error message is already set in the state and should be displayed by the modal
      }
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
    console.log('[FileManagerContext] handleRenameItem called:', { path, newName });
    
    try {
      const response = await renameItem(path, newName);
      console.log('[FileManagerContext] API response for renameItem:', response);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Item renamed successfully');
        console.log('[FileManagerContext] Renaming successful, reloading items...');
        await loadItems();
      } else {
        setError(response.message || 'Failed to rename item');
        console.error('[FileManagerContext] Renaming failed:', response.message);
      }
    } catch (err) {
      setError('Error renaming item: ' + (err.message || 'Unknown error'));
      console.error('[FileManagerContext] Error in handleRenameItem:', err);
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
  const toggleSelectItem = useCallback((item, event) => {
    const isShiftPressed = event.shiftKey;
    const isCtrlCmdPressed = event.ctrlKey || event.metaKey;
    const isSelected = selectedItems.some(selected => selected.path === item.path);
    
    let newSelectedItems = [...selectedItems];
    
    if (isShiftPressed && selectedItems.length > 0) {
      // This logic needs the full `items` array to find the range
      const lastSelectedItem = selectedItems[selectedItems.length - 1];
      const lastSelectedIndex = items.findIndex(i => i.path === lastSelectedItem.path);
      const currentItemIndex = items.findIndex(i => i.path === item.path);
 
      const start = Math.min(lastSelectedIndex, currentItemIndex);
      const end = Math.max(lastSelectedIndex, currentItemIndex);
 
      // Select items within the range
      const rangeItems = items.slice(start, end + 1);
      newSelectedItems = [...newSelectedItems, ...rangeItems];
    } else if (isCtrlCmdPressed) {
      // Ctrl/Cmd toggles the specific item without affecting others
      if (isSelected) {
        newSelectedItems = newSelectedItems.filter(i => i.path !== item.path);
      } else {
        newSelectedItems = [...newSelectedItems, item];
      }
    } else {
      // Standard click (no modifier or shift on empty selection)
      // If it's already selected, deselect it. Otherwise, add it to the selection.
      if (isSelected) {
        newSelectedItems = newSelectedItems.filter(i => i.path !== item.path);
      } else {
        newSelectedItems = [...newSelectedItems, item]; // Add the clicked item
      }
    }
    
    setSelectedItems(newSelectedItems);
  }, [items, selectedItems]); // Depend on items for shift select range calculation

  /**
   * Toggle select all items
   */
  const toggleSelectAll = useCallback(() => {
    // Check if all current items are already selected
    const allSelected = items.length > 0 && selectedItems.length === items.length;

    if (allSelected) {
      setSelectedItems([]); // Deselect all
    } else {
      setSelectedItems([...items]); // Select all
    }
  }, [items, selectedItems]);

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

  /**
   * Show the context menu at the specified position.
   *
   * @param {Object} item The item that was right-clicked.
   * @param {Event} event The contextmenu event object.
   */
  const showContextMenu = (item, event) => {
    setContextMenu({
      visible: true,
      x: event.pageX,
      y: event.pageY,
      item: item,
    });
  };

  /**
   * Hide the context menu.
   */
  const hideContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false, item: null }));
  };

  /**
   * Open the rename modal.
   *
   * @param {Object} item The item to rename.
   */
  const openRenameModal = (item) => {
    setRenameModalState({ isOpen: true, item: item });
  };

  /**
   * Close the rename modal.
   */
  const closeRenameModal = () => {
    setRenameModalState({ isOpen: false, item: null });
  };

  /**
   * Open the create folder modal.
   */
  const openCreateFolderModal = () => {
    setCreateFolderModalState({ isOpen: true });
  };

  /**
   * Close the create folder modal.
   */
  const closeCreateFolderModal = () => {
    setCreateFolderModalState({ isOpen: false });
  };

  /**
   * Open the delete confirmation modal.
   */
  const openDeleteModal = () => {
    // We might enhance this later to pass the items to be deleted
    setDeleteModalState({ isOpen: true });
  };

  /**
   * Close the delete confirmation modal.
   */
  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false });
  };

  /**
   * Open the upload modal.
   */
  const openUploadModal = useCallback(() => {
    setUploadModalState({ isOpen: true });
  }, []);

  /**
   * Close the upload modal.
   */
  const closeUploadModal = useCallback(() => {
    setUploadModalState({ isOpen: false });
  }, []);

  /**
   * Clear upload error
   */
  const clearUploadError = useCallback(() => {
    setUploadError(null);
  }, []);

  /**
   * Load items when current path changes
   */
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

  /**
   * Open the file editor modal and load content.
   * 
   * @param {Object} file The file item to edit.
   */
  const openFileEditor = async (file) => {
    if (file.type !== 'file') return; // Only open for files

    // Reset state and show loading indicator
    setEditorState({
      isOpen: true,
      file: file,
      content: '',
      isLoading: true,
      error: null,
    });

    try {
      const response = await getFileContent(file.path);
      if (response.success) {
        setEditorState(prev => ({ ...prev, content: response.content, isLoading: false }));
      } else {
        throw new Error(response.message || 'Failed to load file content.');
      }
    } catch (err) {
      console.error("Error loading file content:", err);
      setEditorState(prev => ({ ...prev, isLoading: false, error: err.message }));
      // Optionally, close the editor or show error within it
    }
  };

  /**
   * Close the file editor modal.
   */
  const closeFileEditor = () => {
    setEditorState({ isOpen: false, file: null, content: '', isLoading: false, error: null });
  };

  /**
   * Save the content in the file editor.
   */
  const saveEditedFile = async () => {
    if (!editorState.file) return;

    setEditorState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await saveFileContent(editorState.file.path, editorState.content);
      if (response.success) {
        closeFileEditor();
        setSuccessMessage(response.message || 'File saved successfully!');
        // Optionally reload items if needed, though content change doesn't affect listing directly
        // loadItems(); 
      } else {
        throw new Error(response.message || 'Failed to save file content.');
      }
    } catch (err) {
      console.error("Error saving file content:", err);
      setEditorState(prev => ({ ...prev, isLoading: false, error: err.message }));
      // Keep editor open to show error
    }
  };

  /**
   * Update editor content state as user types.
   *
   * @param {string} newContent The new content from the editor.
   */
  const handleEditorContentChange = (newContent) => {
    setEditorState(prev => ({ ...prev, content: newContent }));
  };

  // Memoized context value
  const value = useMemo(() => ({
    currentPath,
    items, // The actual items array
    selectedItems,
    loading,
    error,
    successMessage,
    uploadError, // Provide uploadError state
    clearUploadError, // Add the clear function
    // Core actions
    loadItems, // Maybe useful for manual refresh?
    handleCreateFolder,
    handleUploadFiles,
    handleDeleteItems,
    handleRenameItem,
    // Navigation
    navigateTo,
    navigateToParent,
    // Selection
    toggleSelectItem,
    toggleSelectAll, // Expose the new function
    areAllItemsSelected: items.length > 0 && selectedItems.length === items.length, // Derived state
    isItemSelected,
    clearSelection, // Added clearSelection
    // Sorting
    sortKey,
    sortDirection,
    setSort,
    // Context Menu
    contextMenu,
    showContextMenu,
    hideContextMenu,
    // File Editor
    editorState,
    openFileEditor,
    closeFileEditor,
    saveEditedFile,
    handleEditorContentChange,
    // Modals State & Controls
    renameModalState,
    openRenameModal,
    closeRenameModal,
    createFolderModalState,
    openCreateFolderModal,
    closeCreateFolderModal,
    deleteModalState,
    openDeleteModal,
    closeDeleteModal,
    uploadModalState,
    openUploadModal,
    closeUploadModal,
  }), [
    currentPath,
    items,
    selectedItems,
    loading,
    error,
    successMessage,
    uploadError, // Add uploadError to dependency array
    sortKey,
    sortDirection,
    contextMenu,
    editorState,
    renameModalState,
    createFolderModalState,
    deleteModalState,
    uploadModalState,
  ]);

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
