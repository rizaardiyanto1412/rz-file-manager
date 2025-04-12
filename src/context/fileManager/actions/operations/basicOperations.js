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
  createFile,
  renameItem
} from '../../../../services/api';
import { sortItems } from '../../utils/sortUtils';

/**
 * Basic file operations
 *
 * @param {Object} state Current state
 * @param {Function} updateState Function to update state
 * @return {Object} Basic file operations
 */
export const useBasicOperations = (state, updateState) => {
  const {
    currentPath,
    sortKey,
    sortDirection
  } = state;

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
  }, [currentPath, sortKey, sortDirection, updateState]);

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

  return {
    loadItems,
    handleCreateFolder,
    handleCreateFile,
    handleRenameItem
  };
};
