/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useUtilityOperations } from './operations/utilityOperations';
import { useBasicOperations } from './operations/basicOperations';
import { useDeleteOperations } from './operations/deleteOperations';
import { useUploadOperations } from './operations/uploadOperations';
import { useEditorOperations } from './operations/editorOperations';

/**
 * Hook for file operation actions
 *
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @return {Object} File operation actions
 */
export const useFileOperations = (state, setState) => {
  // Get utility operations first as they're used by other operations
  const { updateState, clearMessages, clearUploadError } = useUtilityOperations(state, setState);
  
  // Get basic operations
  const { 
    loadItems, 
    handleCreateFolder, 
    handleCreateFile, 
    handleRenameItem 
  } = useBasicOperations(state, updateState);
  
  // Get delete operations
  const { 
    handleDeleteSelectedItems, 
    handleDeleteItem 
  } = useDeleteOperations(state, updateState, loadItems);
  
  // Get upload operations
  const { 
    handleUploadFiles 
  } = useUploadOperations(state, updateState, loadItems);
  
  // Get editor operations
  const { 
    openFileEditor, 
    closeFileEditor, 
    saveEditedFile, 
    handleEditorContentChange 
  } = useEditorOperations(state, updateState);

  // Return all operations
  return {
    // Basic operations
    loadItems,
    handleCreateFolder,
    handleCreateFile,
    handleRenameItem,
    
    // Delete operations
    handleDeleteSelectedItems,
    handleDeleteItem,
    
    // Upload operations
    handleUploadFiles,
    
    // Editor operations
    openFileEditor,
    closeFileEditor,
    saveEditedFile,
    handleEditorContentChange,
    
    // Utility operations
    clearMessages,
    clearUploadError
  };
};
