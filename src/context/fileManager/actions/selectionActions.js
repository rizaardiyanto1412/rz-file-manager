/**
 * WordPress dependencies
 */
import { useCallback } from '@wordpress/element';

/**
 * Hook for selection actions
 * 
 * @param {Object} state Current state
 * @param {Function} setState Function to update state
 * @return {Object} Selection actions
 */
export const useSelectionActions = (state, setState) => {
  const { items, selectedItems } = state;

  /**
   * Set state helper function
   * 
   * @param {Object} newState New state to set
   */
  const updateState = (newState) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };

  /**
   * Toggle item selection
   * 
   * @param {Object} item Item to select/deselect
   * @param {Event} event Mouse event
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
    
    updateState({ selectedItems: newSelectedItems });
  }, [items, selectedItems]);

  /**
   * Toggle select all items
   */
  const toggleSelectAll = useCallback(() => {
    // Check if all current items are already selected
    const allSelected = items.length > 0 && selectedItems.length === items.length;

    if (allSelected) {
      updateState({ selectedItems: [] }); // Deselect all
    } else {
      updateState({ selectedItems: [...items] }); // Select all
    }
  }, [items, selectedItems]);

  /**
   * Check if an item is selected
   * 
   * @param {Object} item Item to check
   * @return {boolean} True if item is selected
   */
  const isItemSelected = useCallback((item) => {
    return selectedItems.some(selected => selected.path === item.path);
  }, [selectedItems]);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    updateState({ selectedItems: [] });
  }, []);

  return {
    toggleSelectItem,
    toggleSelectAll,
    isItemSelected,
    clearSelection,
    areAllItemsSelected: items.length > 0 && selectedItems.length === items.length
  };
};
