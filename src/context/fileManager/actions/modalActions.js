/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Hook for modal actions
 * 
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @return {Object} Modal actions
 */
export const useModalActions = (state, setState) => {
  /**
   * Set state helper function
   * 
   * @param {Object} newState New state to set
   */
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  /**
   * Context menu actions
   */
  // Unified context menu for both file/folder and whitespace
  const showContextMenu = useCallback((item, event) => {
    updateState({
      contextMenu: {
        visible: true,
        x: event.pageX,
        y: event.pageY,
        item: item,
      }
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    updateState({
      contextMenu: { 
        visible: false, 
        x: 0, 
        y: 0, 
        item: null 
      }
    });
  }, []);

  /**
   * Rename modal actions
   */
  const openRenameModal = useCallback((item) => {
    updateState({
      renameModalState: { 
        isOpen: true, 
        item: item 
      }
    });
  }, []);

  const closeRenameModal = useCallback(() => {
    updateState({
      renameModalState: { 
        isOpen: false, 
        item: null 
      }
    });
  }, []);

  /**
   * Create folder modal actions
   */
  const openCreateFolderModal = useCallback(() => {
    updateState({
      createFolderModalState: { 
        isOpen: true 
      }
    });
  }, []);

  const closeCreateFolderModal = useCallback(() => {
    updateState({
      createFolderModalState: { 
        isOpen: false 
      }
    });
  }, []);

  /**
   * Delete modal actions
   */
  const openDeleteModal = useCallback((items) => {
    if (!items || items.length === 0) {
      console.warn('openDeleteModal called with no items.');
      return;
    }
    updateState({
      deleteModalState: { 
        isOpen: true, 
        itemsToDelete: items 
      }
    });
  }, []);

  const closeDeleteModal = useCallback(() => {
    updateState({
      deleteModalState: { 
        isOpen: false, 
        itemsToDelete: [] 
      }
    });
  }, []);

  /**
   * Upload modal actions
   */
  const openUploadModal = useCallback(() => {
    updateState({
      uploadModalState: { 
        isOpen: true 
      }
    });
  }, []);

  const closeUploadModal = useCallback(() => {
    updateState({
      uploadModalState: { 
        isOpen: false 
      }
    });
  }, []);

  /**
   * New file modal actions
   */
  const openNewFileModal = useCallback(() => {
    updateState({
      newFileModalState: { 
        isOpen: true 
      }
    });
  }, []);

  const closeNewFileModal = useCallback(() => {
    updateState({
      newFileModalState: { 
        isOpen: false 
      }
    });
  }, []);

  return {
    // Context menu
    showContextMenu,
    hideContextMenu,
    // Rename modal
    openRenameModal,
    closeRenameModal,
    // Create folder modal
    openCreateFolderModal,
    closeCreateFolderModal,
    // Delete modal
    openDeleteModal,
    closeDeleteModal,
    // Upload modal
    openUploadModal,
    closeUploadModal,
    // New file modal
    openNewFileModal,
    closeNewFileModal
  };
};
