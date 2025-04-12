/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { copyItem, moveItem } from '../../../services/api';

/**
 * Hook for clipboard actions
 *
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @param {Function} loadItems Function to reload items
 * @return {Object} Clipboard actions
 */
export const useClipboardActions = (state, setState, loadItems) => {
  const { currentPath, clipboardState } = state;

  /**
   * Set state helper function
   *
   * @param {Object} newState New state to set
   */
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  /**
   * Copy items to clipboard
   *
   * @param {Array} itemsToCopy Items to copy
   */
  const handleCopyItems = useCallback((itemsToCopy) => {
    if (!itemsToCopy || itemsToCopy.length === 0) return;

    updateState({
      clipboardState: { action: 'copy', items: itemsToCopy },
      successMessage: `${itemsToCopy.length} item(s) added to clipboard for copying.`,
      error: null
    });
  }, []);

  /**
   * Cut items to clipboard
   *
   * @param {Array} itemsToCut Items to cut
   */
  const handleCutItems = useCallback((itemsToCut) => {
    if (!itemsToCut || itemsToCut.length === 0) return;

    updateState({
      clipboardState: { action: 'cut', items: itemsToCut },
      successMessage: `${itemsToCut.length} item(s) added to clipboard for cutting.`,
      error: null
    });
  }, []);

  /**
   * Paste items from clipboard
   */
  const handlePasteItems = useCallback(async () => {
    const { action, items } = clipboardState;
    if (!action || !items || items.length === 0) {
      updateState({ error: 'Clipboard is empty or action is invalid.' });
      return;
    }

    updateState({
      loading: true,
      error: null,
      successMessage: null
    });

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
      updateState({ error: `${failedOps.length} item(s) failed to ${action}. Error: ${errorMessages[0]}` });
    }

    if (successfulOps.length > 0) {
      updateState({ successMessage: `${successfulOps.length} item(s) ${operationVerb} successfully to ${destinationDir}.` });
      // Clear clipboard only after a successful 'cut' operation
      if (action === 'cut') {
        updateState({ clipboardState: { action: null, items: [] } });
      }
      // Refresh the current directory to show pasted items
      await loadItems();
    }

    updateState({ loading: false });
  }, [clipboardState, currentPath, loadItems]);

  return {
    handleCopyItems,
    handleCutItems,
    handlePasteItems
  };
};
