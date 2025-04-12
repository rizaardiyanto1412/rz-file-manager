/**
 * Internal dependencies
 */
import { getFileContent, saveFileContent } from '../../../../services/api';

/**
 * File editor operations for file manager
 *
 * @param {Object} state Current state
 * @param {Function} updateState Function to update state
 * @return {Object} Editor operations
 */
export const useEditorOperations = (state, updateState) => {
  /**
   * Open file editor
   * 
   * @param {Object} file File to open
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

  /**
   * Close file editor
   */
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

  /**
   * Save edited file
   */
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

  /**
   * Handle editor content change
   * 
   * @param {string} newContent New content
   */
  const handleEditorContentChange = (newContent) => {
    const { editorState } = state;
    updateState({
      editorState: {
        ...editorState,
        content: newContent
      }
    });
  };

  return {
    openFileEditor,
    closeFileEditor,
    saveEditedFile,
    handleEditorContentChange
  };
};
