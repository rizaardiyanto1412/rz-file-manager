/**
 * Internal dependencies
 */
import { uploadFile } from '../../../../services/api';

/**
 * Upload operations for file manager
 *
 * @param {Object} state Current state
 * @param {Function} updateState Function to update state
 * @param {Function} loadItems Function to reload items
 * @return {Object} Upload operations
 */
export const useUploadOperations = (state, updateState, loadItems) => {
  const { currentPath } = state;

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

  return {
    handleUploadFiles
  };
};
