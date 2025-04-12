/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { zipItem, unzipItem } from '../../../services/api';

/**
 * Hook for zip/unzip actions
 *
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @param {Function} loadItems Function to reload items
 * @return {Object} Zip actions
 */
export const useZipActions = (state, setState, loadItems) => {
  const { currentPath } = state;

  /**
   * Set state helper function
   *
   * @param {Object} newState New state to set
   */
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  /**
   * Handler for zipping an item.
   *
   * @param {string} path The relative path of the item to zip.
   */
  const handleZipItem = useCallback(async (path) => {
    console.log('Attempting to zip:', path);
    updateState({
      loading: true,
      error: null,
      successMessage: null
    });

    try {
      await zipItem(path);
      // Refresh the list to show the new zip file
      await loadItems();
      updateState({ successMessage: 'Item zipped successfully.' });
    } catch (err) {
      console.error('Zip failed:', err);
      updateState({
        error: err.message || 'Failed to zip item. Please ensure the server has permissions and the PHP Zip extension is enabled.'
      });
    } finally {
      updateState({ loading: false });
    }
  }, [currentPath, loadItems]);

  /**
   * Handler for unzipping an item.
   *
   * @param {string} path The relative path of the zip file to unzip.
   * @param {boolean} [unzipHere=false] Optional. If true, unzip directly into the current directory. Defaults to false (unzip into a new folder).
   */
  const handleUnzipItem = useCallback(async (path, unzipHere = false) => {
    console.log(`Attempting to unzip: ${path}, Unzip Here: ${unzipHere}`);
    updateState({
      loading: true,
      error: null,
      successMessage: null
    });

    try {
      await unzipItem(path, unzipHere);
      // Refresh the list to show the extracted contents
      await loadItems();
      updateState({ successMessage: 'Archive extracted successfully.' });
    } catch (err) {
      console.error('Unzip failed:', err);
      let message = 'Failed to unzip archive.';
      if (err.code === 'unzip_destination_exists') {
        message = err.message || 'Cannot extract: A file or folder with the target name already exists.';
      } else if (err.message) {
        message = err.message;
      }
      updateState({ error: message });
    } finally {
      updateState({ loading: false });
    }
  }, [currentPath, loadItems]);

  return {
    handleZipItem,
    handleUnzipItem
  };
};
