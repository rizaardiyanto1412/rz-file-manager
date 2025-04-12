/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { deleteItem } from '../../../../services/api';

/**
 * Delete operations for file manager
 *
 * @param {Object} state Current state
 * @param {Function} updateState Function to update state
 * @param {Function} loadItems Function to reload items
 * @return {Object} Delete operations
 */
export const useDeleteOperations = (state, updateState, loadItems) => {
  const { deleteModalState } = state;

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
  }, [deleteModalState.itemsToDelete, updateState, loadItems]);

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

  return {
    handleDeleteSelectedItems,
    handleDeleteItem
  };
};
