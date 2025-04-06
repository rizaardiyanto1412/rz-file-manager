/**
 * WordPress dependencies
 */
import { createContext, useState, useContext, useEffect, useCallback, useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { 
  fetchFiles, 
  createFolder, 
  uploadFile, 
  deleteItem, 
  renameItem, 
  copyItem, 
  moveItem, 
  getFileContent, 
  saveFileContent, 
  createFile, 
  zipItem, 
  unzipItem 
} from '../services/api';

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
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, itemsToDelete: [] }); // Store array of items

  // State for Upload Modal
  const [uploadModalState, setUploadModalState] = useState({ isOpen: false });

  // State for Upload Error
  const [uploadError, setUploadError] = useState(null);

  // State for New File Modal
  const [newFileModalState, setNewFileModalState] = useState({ isOpen: false });

  // ** NEW ** State for clipboard (copy/cut)
  const [clipboardState, setClipboardState] = useState({ action: null, items: [] });

  /**
   * Load files and folders for the current path
   */
  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSelectedItems([]);
    hideContextMenu(); 
    
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
  }, [currentPath, sortKey, sortDirection]); // Reload when path changes

  // Initial load
  useEffect(() => {
    loadItems();
  }, [currentPath]); // Reload when path changes

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
    setSuccessMessage(null); // Clear previous success message
    closeCreateFolderModal(); // Close modal immediately

    try {
      const response = await createFolder(currentPath, name);
      if (response.success) {
        setSuccessMessage(response.message || 'Folder created successfully');
        await loadItems(); // Reload items to show the new folder
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
   * Create a new empty file
   * 
   * @param {string} filename The full filename (including extension)
   */
  const handleCreateFile = async (filename) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear previous success message
    closeNewFileModal(); // Close modal immediately

    try {
      const response = await createFile(currentPath, filename);
      if (response.success) {
        setSuccessMessage(response.message || 'File created successfully');
        await loadItems(); // Reload items to show the new file
      } else {
        setError(response.message || 'Failed to create file');
      }
    } catch (err) {
      setError('Error creating file: ' + (err.message || 'Unknown error'));
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
    if (!files || files.length === 0) {
      setError('No files selected for upload.');
      setTimeout(() => setError(null), 3000);
      closeUploadModal(); // Close modal even if no files selected
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear previous success message
    setUploadError(null); // Clear previous errors on new upload attempt
    let overallSuccess = true; // Track overall success
    let finalMessage = '';

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await uploadFile(currentPath, file);

        if (!response.success) {
          setError(`Failed to upload ${file.name}: ${response.message || 'Unknown error'}`);
          setUploadError(response.message || 'An unknown error occurred.'); // Set the specific error message from the response
          overallSuccess = false; // Mark failure
          // Decide if you want to break or continue uploading others
          // break; // Uncomment to stop on first error
        } else {
        }
      }

      if (overallSuccess) {
        finalMessage = files.length > 1 ? 'Files uploaded successfully' : 'File uploaded successfully';
        setSuccessMessage(finalMessage);
      } else {
        // Error message was already set for the specific file(s)
      }

      await loadItems(); // Reload items

    } catch (err) {
      setError('Error uploading files: ' + (err.message || 'Unknown error'));
      setUploadError(err.message || 'A critical error occurred during upload.'); // Set error message from catch block
      overallSuccess = false; // Mark failure on catch
    } finally {
      setLoading(false);
      // Only close the modal automatically if ALL uploads were successful
      if (overallSuccess) {
        closeUploadModal();
      } else {
        // The error message is already set in the state and should be displayed by the modal
      }
    }
  };

  /**
   * Delete SELECTED items
   */
  const handleDeleteSelectedItems = useCallback(async () => {
    const items = deleteModalState.itemsToDelete;
    if (!items || items.length === 0) {
      console.error('No items selected for deletion in modal state.');
      closeDeleteModal();
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear previous success message
    closeDeleteModal(); // Close modal first

    try {
      // Delete each selected item
      const promises = items.map(item => deleteItem(item.path));
      const results = await Promise.allSettled(promises);

      const failedDeletions = results.filter(result => result.status === 'rejected');
      const successfulDeletions = results.filter(result => result.status === 'fulfilled' && result.value.success);

      if (failedDeletions.length > 0) {
        console.error('Failed deletions:', failedDeletions);
        // Combine error messages or show a generic one
        const errorMessages = failedDeletions.map(fail => fail.reason?.message || `Failed to delete an item.`);
        setError(`Failed to delete ${failedDeletions.length} item(s). Errors: ${errorMessages.join(', ')}`);
      }
      
      if (successfulDeletions.length > 0) {
        setSuccessMessage(`${successfulDeletions.length} item(s) deleted successfully.`);
      }

      // Refresh the list after deletion
      await loadItems(currentPath);

    } catch (err) {
      console.error('Deletion failed:', err);
      // This catch might be less necessary now with Promise.allSettled handling individual errors
      setError(err.message || 'An unexpected error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  }, [currentPath, deleteModalState.itemsToDelete]); // Depend on the array of items

  /**
   * Delete a SINGLE item
   */
  const handleDeleteItem = async () => {
    if (!deleteModalState.itemsToDelete || deleteModalState.itemsToDelete.length === 0) return; // Safety check

    const item = deleteModalState.itemsToDelete[0];
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear previous success message
    closeDeleteModal(); // Close modal immediately

    try {
      const response = await deleteItem(item.path); // Call API with the specific path
      if (response.success) {
        setSuccessMessage(response.message || 'Item deleted successfully');
        await loadItems(); // Reload
      } else {
        setError(`Failed to delete ${item.name}: ${response.message || 'Unknown error'}`);
      }
    } catch (err) {
      setError('Error deleting item: ' + (err.message || 'Unknown error'));
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
    setSuccessMessage(null); // Clear previous success message
    
    try {
      const response = await renameItem(path, newName);
      
      if (response.success) {
        setSuccessMessage(response.message || 'Item renamed successfully');
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
  const clearMessages = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
  }, []); // No dependencies needed as it only uses setters

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
   *
   * @param {Object[]} items The items to potentially delete.
   */
  const openDeleteModal = useCallback((items) => {
    if (!items || items.length === 0) {
      console.warn('openDeleteModal called with no items.');
      return;
    }
    setDeleteModalState({ isOpen: true, itemsToDelete: items });
  }, []);

  /**
   * Close the delete confirmation modal.
   */
  const closeDeleteModal = () => {
    setDeleteModalState({ isOpen: false, itemsToDelete: [] });
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
   * Open the new file modal.
   */
  const openNewFileModal = useCallback(() => {
    setNewFileModalState({ isOpen: true });
  }, []);

  /**
   * Close the new file modal.
   */
  const closeNewFileModal = useCallback(() => {
    setNewFileModalState({ isOpen: false });
  }, []);

  // --- ** NEW ** Clipboard Handlers ---
  const handleCopyItems = useCallback((itemsToCopy) => {
    if (!itemsToCopy || itemsToCopy.length === 0) return;
    setClipboardState({ action: 'copy', items: itemsToCopy });
    setSuccessMessage(`${itemsToCopy.length} item(s) added to clipboard for copying.`);
    // Clear any lingering error messages
    setError(null);
  }, []);

  const handleCutItems = useCallback((itemsToCut) => {
    if (!itemsToCut || itemsToCut.length === 0) return;
    setClipboardState({ action: 'cut', items: itemsToCut });
    setSuccessMessage(`${itemsToCut.length} item(s) added to clipboard for cutting.`);
    // Clear any lingering error messages
    setError(null);
  }, []);

  const handlePasteItems = useCallback(async () => {
    const { action, items } = clipboardState;
    if (!action || !items || items.length === 0) {
      setError('Clipboard is empty or action is invalid.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const destinationDir = currentPath; // Paste into the current directory
    const operation = action === 'copy' ? copyItem : moveItem;
    const operationVerb = action === 'copy' ? 'copied' : 'moved';

    const promises = items.map(item => {
      const sourcePath = item.path; 
      // Construct destination path carefully, avoiding double slashes if root
      const destinationPath = destinationDir === '/' 
                               ? '/' + item.name 
                               : destinationDir + '/' + item.name;
      return operation(sourcePath, destinationPath);
    });

    const results = await Promise.allSettled(promises);

    const failedOps = results.filter(result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success));
    const successfulOps = results.filter(result => result.status === 'fulfilled' && result.value.success);

    if (failedOps.length > 0) {
      console.error(`Failed ${action} operations:`, failedOps);
      const errorMessages = failedOps.map(fail => {
         const reason = fail.reason || fail.value; // Get error from rejected promise or failed success response
         return reason?.message || `Failed to ${action} an item.`;
      });
      // Show first error message, or a generic one
      setError(`${failedOps.length} item(s) failed to ${action}. Error: ${errorMessages[0]}`);
    }

    if (successfulOps.length > 0) {
      setSuccessMessage(`${successfulOps.length} item(s) ${operationVerb} successfully to ${destinationDir}.`);
      // Clear clipboard only after a successful 'cut' operation
      if (action === 'cut') {
        setClipboardState({ action: null, items: [] });
      }
      // Refresh the current directory to show pasted items
      await loadItems(currentPath);
    }

    setLoading(false);

  }, [clipboardState, currentPath]);

  /**
   * Load items when current path changes
   */
  useEffect(() => {
    loadItems();
  }, [currentPath, sortKey, sortDirection]);

  /**
   * Handler for zipping an item.
   * @param {string} path The relative path of the item to zip.
   */
  const handleZipItem = useCallback(async (path) => {
    console.log('Attempting to zip:', path);
    setLoading(true);
    setError(null);
    setSuccessMessage(null); // Clear previous success message
    try {
      await zipItem(path);
      // Refresh the list to show the new zip file
      await loadItems(currentPath);
      setSuccessMessage('Item zipped successfully.'); // Set success message AFTER refresh
    } catch (err) {
       console.error('Zip failed:', err);
      setError(err.message || 'Failed to zip item. Please ensure the server has permissions and the PHP Zip extension is enabled.');
      // Removed showSnackbar call
    } finally {
      setLoading(false);
    }
  }, [currentPath]);

  /**
   * Handler for unzipping an item.
   * @param {string} path The relative path of the zip file to unzip.
   * @param {boolean} [unzipHere=false] Optional. If true, unzip directly into the current directory. Defaults to false (unzip into a new folder).
   */
  const handleUnzipItem = useCallback(async (path, unzipHere = false) => { 
      console.log(`Attempting to unzip: ${path}, Unzip Here: ${unzipHere}`); 
      setLoading(true);
      setError(null);
      setSuccessMessage(null); // Clear previous success message
      try {
          await unzipItem(path, unzipHere); 
          // Refresh the list to show the extracted contents
          await loadItems(currentPath);
          setSuccessMessage('Archive extracted successfully.'); // Set success message AFTER refresh
      } catch (err) {
          console.error('Unzip failed:', err);
          let message = 'Failed to unzip archive.';
          if (err.code === 'unzip_destination_exists') {
              message = err.message || 'Cannot extract: A file or folder with the target name already exists.';
          } else if (err.message) {
              message = err.message;
          }
          setError(message);
          // Removed showSnackbar call
      } finally {
          setLoading(false);
      }
  }, [currentPath]);

  // Memoized context value
  const value = useMemo(() => ({
    currentPath,
    items, // The actual items array
    selectedItems,
    loading,
    error,
    successMessage, // Provide success message state
    uploadError, // Provide uploadError state
    clearUploadError, // Function to clear only upload errors
    clearMessages,    // Function to clear general error/success messages
    // Core actions
    loadItems, // Maybe useful for manual refresh?
    handleCreateFolder,
    handleCreateFile,
    handleUploadFiles,
    handleDeleteSelectedItems, // Keep the handler for toolbar delete
    handleDeleteItem, // Provide the handler for single item delete
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
    setSort: (newKey) => {
      const newDirection = (sortKey === newKey && sortDirection === 'asc') ? 'desc' : 'asc';
      setSortKey(newKey);
      setSortDirection(newDirection);
      // Re-sort existing items immediately
      setItems(prevItems => sortItems(prevItems, newKey, newDirection));
    },
    // Context Menu
    contextMenu,
    showContextMenu,
    hideContextMenu,
    // File Editor
    editorState,
    openFileEditor: async (file) => {
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
        setEditorState(prev => ({ ...prev, isLoading: false, error: err.message }));
        // Optionally, close the editor or show error within it
      }
    },
    closeFileEditor: () => {
      setEditorState({ isOpen: false, file: null, content: '', isLoading: false, error: null });
    },
    saveEditedFile: async () => {
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
        setEditorState(prev => ({ ...prev, isLoading: false, error: err.message }));
        // Keep editor open to show error
      }
    },
    handleEditorContentChange: (newContent) => {
      setEditorState(prev => ({ ...prev, content: newContent }));
    },
    // Modals State & Controls
    renameModalState,
    openRenameModal,
    closeRenameModal,
    createFolderModalState,
    openCreateFolderModal,
    closeCreateFolderModal,
    deleteModalState, // Provide the modified state
    openDeleteModal, // Provide the modified opener
    closeDeleteModal, // Provide the modified closer
    uploadModalState,
    openUploadModal,
    closeUploadModal,
    newFileModalState, // **NEW** Add new file modal state
    openNewFileModal, // **NEW** Add new file modal controls
    closeNewFileModal,
    handleZipItem, // Add zip handler
    handleUnzipItem, // Add unzip handler
    // Clipboard state and actions
    clipboardState,
    handleCopyItems,
    handleCutItems,
    handlePasteItems,
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
    deleteModalState, // Add dependency
    uploadModalState,
    newFileModalState, // **NEW** Add dependency
    clearMessages, // Add clearMessages to dependencies
    handleZipItem, 
    handleUnzipItem,
    // Clipboard dependencies
    clipboardState,
    handleCopyItems,
    handleCutItems,
    handlePasteItems,
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
