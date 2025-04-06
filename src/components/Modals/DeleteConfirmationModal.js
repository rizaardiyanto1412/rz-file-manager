/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../../context/FileManagerContext';

/**
 * Delete Confirmation Modal Component
 *
 * Displays a modal for confirming deletion of a specific file or folder
 * initiated via the context menu or potentially the toolbar (if adapted).
 *
 * @return {JSX.Element | null} The rendered component or null if not open.
 */
const DeleteConfirmationModal = () => {
  // Get state and methods from context related to single item deletion
  const {
    deleteModalState, // { isOpen, itemToDelete }
    closeDeleteModal,
    handleDeleteItem, // The function for single item delete
    loading, // To disable buttons during operation
  } = useFileManager();

  // Don't render if the modal isn't open or if there's no item specified
  if (!deleteModalState.isOpen || !deleteModalState.itemToDelete) {
    return null;
  }

  const item = deleteModalState.itemToDelete;

  /**
   * Handle confirm button click
   */
  const handleConfirm = () => {
    // Call the context function designed for single item deletion
    handleDeleteItem();
    // This function will handle API call, loading state, and closing the modal
  };

  /**
   * Get confirmation message for the single item
   *
   * @return {string} Confirmation message
   */
  const getConfirmationMessage = () => {
    if (!item) return ''; // Should not happen due to the check above

    if (item.type === 'directory') {
      return __(
        `Are you sure you want to delete the folder "${item.name}" and all its contents? This action cannot be undone.`,
        'rz-file-manager'
      );
    } else {
      return __(
        `Are you sure you want to delete the file "${item.name}"? This action cannot be undone.`,
        'rz-file-manager'
      );
    }
  };

  return (
    <Modal
      title={__('Confirm Deletion', 'rz-file-manager')}
      onRequestClose={closeDeleteModal} // Use context function to close
      className="rz-file-manager__modal rz-file-manager__delete-modal"
      shouldCloseOnClickOutside={true} // Allow clicking outside to close
      shouldCloseOnEsc={true} // Allow Esc key to close
    >
      <div className="rz-file-manager__modal-content">
        <p>{getConfirmationMessage()}</p>
        {/* Optional: Can add more details about the item here if needed */}
        {/* 
          <p>
            <strong>{item.name}</strong> ({item.type})
          </p>
        */}
        <p className="rz-fm-delete-warning">
          {__('This action cannot be undone.', 'rz-file-manager')}
        </p>
      </div>

      <div className="rz-file-manager__modal-footer">
        <Button
          variant="secondary"
          onClick={closeDeleteModal} // Use context function to close
          disabled={loading} // Disable if loading
        >
          {__('Cancel', 'rz-file-manager')}
        </Button>

        <Button
          variant="primary"
          onClick={handleConfirm} // Call the correct handler
          isDestructive
          disabled={loading} // Disable if loading
        >
          {loading ? __('Deleting...', 'rz-file-manager') : __('Delete', 'rz-file-manager')}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
