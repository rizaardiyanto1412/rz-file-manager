/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import {
  fetchFiles,
  createFolder,
  uploadFile,
  deleteItem,
  renameItem,
  createFile,
  getFileContent,
  saveFileContent
} from '../../../services/api';
import { sortItems } from '../utils/sortUtils';

/**
 * Hook for file operation actions
 *
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @return {Object} File operation actions
 */
export const useFileOperations = (state, setState) => {
  const {
    currentPath,
    sortKey,
    sortDirection,
    deleteModalState
  } = state;

  /**
   * Set state helper function
   *
   * @param {Object} newState New state to set
   */
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  /**
   * Load files and folders for the current path
   */
  const loadItems = useCallback(async () => {
    updateState({
      loading: true,
      error: null,
      selectedItems: []
    });

    // Hide context menu if it's open
    updateState({
      contextMenu: { visible: false, x: 0, y: 0, item: null }
    });

    try {
      const response = await fetchFiles(currentPath);
      if (response.success) {
        const sortedData = sortItems(response.items, sortKey, sortDirection);
        updateState({ items: sortedData });
      } else {
        updateState({ error: response.message || 'Failed to load files' });
      }
    } catch (err) {
      updateState({ error: 'Error loading files: ' + (err.message || 'Unknown error') });
    } finally {
      updateState({ loading: false });
    }
  }, [currentPath, sortKey, sortDirection]);

  /**
   * Create a new folder
   *
   * @param {string} name Folder name
   */
  const handleCreateFolder = async (name) => {
    updateState({
      loading: true,
      error: null,
      successMessage: null,
      createFolderModalState: { isOpen: false }
    });

    try {
      const response = await createFolder(currentPath, name);
      if (response.success) {
        updateState({ successMessage: response.message || 'Folder created successfully' });
        await loadItems(); // Reload items to show the new folder
      } else {
        updateState({ error: response.message || 'Failed to create folder' });
      }
    } catch (err) {
      updateState({ error: 'Error creating folder: ' + (err.message || 'Unknown error') });
    } finally {
      updateState({ loading: false });
    }
  };

  /**
   * Create a new empty file
   *
   * @param {string} filename The full filename (including extension)
   */
  const handleCreateFile = async (filename) => {
    updateState({
      loading: true,
      error: null,
      successMessage: null,
      newFileModalState: { isOpen: false }
    });

    try {
      const response = await createFile(currentPath, filename);
      if (response.success) {
        updateState({ successMessage: response.message || 'File created successfully' });
        await loadItems(); // Reload items to show the new file
      } else {
        updateState({ error: response.message || 'Failed to create file' });
      }
    } catch (err) {
      updateState({ error: 'Error creating file: ' + (err.message || 'Unknown error') });
    } finally {
      updateState({ loading: false });
    }
  };

  /**
   * Upload files
   *
   * @param {FileList} files Files to upload
   */
  const handleUploadFiles = async (files) => {
    if (!files || files.length === 0) {
      updateState({ error: 'No files selected for upload.' });
      setTimeout(() => updateState({ error: null }), 3000);
      updateState({ uploadModalState: { isOpen: false } });
      return;
    }

    updateState({
      loading: true,
      error: null,
      successMessage: null,
      uploadError: null
    });

    let overallSuccess = true; // Track overall success
    let finalMessage = '';

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await uploadFile(currentPath, file);

        if (!response.success) {
          updateState({
            error: `Failed to upload ${file.name}: ${response.message || 'Unknown error'}`,
            uploadError: response.message || 'An unknown error occurred.'
          });
          overallSuccess = false; // Mark failure
        }
      }

      if (overallSuccess) {
        finalMessage = files.length > 1 ? 'Files uploaded successfully' : 'File uploaded successfully';
        updateState({ successMessage: finalMessage });
      }

      await loadItems(); // Reload items

    } catch (err) {
      updateState({
        error: 'Error uploading files: ' + (err.message || 'Unknown error'),
        uploadError: err.message || 'A critical error occurred during upload.'
      });
      overallSuccess = false; // Mark failure on catch
    } finally {
      updateState({ loading: false });
      // Only close the modal automatically if ALL uploads were successful
      if (overallSuccess) {
        updateState({ uploadModalState: { isOpen: false } });
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
      updateState({ deleteModalState: { isOpen: false, itemsToDelete: [] } });
      return;
    }

    updateState({
      loading: true,
      error: null,
      successMessage: null,
      deleteModalState: { isOpen: false, itemsToDelete: [] }
    });

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
        updateState({ error: `Failed to delete ${failedDeletions.length} item(s). Errors: ${errorMessages.join(', ')}` });
      }

      if (successfulDeletions.length > 0) {
        updateState({ successMessage: `${successfulDeletions.length} item(s) deleted successfully.` });
      }

      // Refresh the list after deletion
      await loadItems();

    } catch (err) {
      console.error('Deletion failed:', err);
      updateState({ error: err.message || 'An unexpected error occurred during deletion.' });
    } finally {
      updateState({ loading: false });
    }
  }, [currentPath, deleteModalState.itemsToDelete]);

  /**
   * Delete a SINGLE item
   */
  const handleDeleteItem = async () => {
    if (!deleteModalState.itemsToDelete || deleteModalState.itemsToDelete.length === 0) return; // Safety check

    const item = deleteModalState.itemsToDelete[0];
    updateState({
      loading: true,
      error: null,
      successMessage: null,
      deleteModalState: { isOpen: false, itemsToDelete: [] }
    });

    try {
      const response = await deleteItem(item.path); // Call API with the specific path
      if (response.success) {
        updateState({ successMessage: response.message || 'Item deleted successfully' });
        await loadItems(); // Reload
      } else {
        updateState({ error: `Failed to delete ${item.name}: ${response.message || 'Unknown error'}` });
      }
    } catch (err) {
      updateState({ error: 'Error deleting item: ' + (err.message || 'Unknown error') });
    } finally {
      updateState({ loading: false });
    }
  };

  /**
   * Rename an item
   *
   * @param {string} path Item path
   * @param {string} newName New name
   */
  const handleRenameItem = async (path, newName) => {
    updateState({
      loading: true,
      error: null,
      successMessage: null
    });

    try {
      const response = await renameItem(path, newName);

      if (response.success) {
        updateState({ successMessage: response.message || 'Item renamed successfully' });
        await loadItems();
      } else {
        updateState({ error: response.message || 'Failed to rename item' });
      }
    } catch (err) {
      updateState({ error: 'Error renaming item: ' + (err.message || 'Unknown error') });
    } finally {
      updateState({ loading: false });
    }
  };

  /**
   * File editor operations
   */
  const openFileEditor = async (file) => {
    if (file.type !== 'file') return; // Only open for files

    // Reset state and show loading indicator
    updateState({
      editorState: {
        isOpen: true,
        file: file,
        content: '',
        isLoading: true,
        error: null,
      }
    });

    try {
      const response = await getFileContent(file.path);
      if (response.success) {
        updateState({
          editorState: {
            isOpen: true,
            file: file,
            content: response.content,
            isLoading: false,
            error: null
          }
        });
      } else {
        throw new Error(response.message || 'Failed to load file content.');
      }
    } catch (err) {
      updateState({
        editorState: {
          isOpen: true,
          file: file,
          content: '',
          isLoading: false,
          error: err.message
        }
      });
    }
  };

  const closeFileEditor = () => {
    updateState({
      editorState: {
        isOpen: false,
        file: null,
        content: '',
        isLoading: false,
        error: null
      }
    });
  };

  const saveEditedFile = async () => {
    const { editorState } = state;
    if (!editorState.file) return;

    updateState({
      editorState: {
        ...editorState,
        isLoading: true,
        error: null
      }
    });

    try {
      const response = await saveFileContent(editorState.file.path, editorState.content);
      if (response.success) {
        closeFileEditor();
        updateState({ successMessage: response.message || 'File saved successfully!' });
      } else {
        throw new Error(response.message || 'Failed to save file content.');
      }
    } catch (err) {
      updateState({
        editorState: {
          ...editorState,
          isLoading: false,
          error: err.message
        }
      });
    }
  };

  const handleEditorContentChange = (newContent) => {
    const { editorState } = state;
    updateState({
      editorState: {
        ...editorState,
        content: newContent
      }
    });
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
    loadItems,
    handleCreateFolder,
    handleCreateFile,
    handleUploadFiles,
    handleDeleteSelectedItems,
    handleDeleteItem,
    handleRenameItem,
    openFileEditor,
    closeFileEditor,
    saveEditedFile,
    handleEditorContentChange,
    clearMessages,
    clearUploadError
  };
};
