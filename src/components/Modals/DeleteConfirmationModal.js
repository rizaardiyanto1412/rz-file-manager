/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Modal, Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../../context/fileManager';

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
    deleteModalState, // { isOpen, itemsToDelete }
    closeDeleteModal,
    handleDeleteSelectedItems, // The function for deleting selected items
    loading, // To disable buttons during operation
  } = useFileManager();

  // Don't render if the modal isn't open or if there's no item specified
  if (!deleteModalState.isOpen || !deleteModalState.itemsToDelete) {
    return null;
  }

  // Determine the message based on the number of items
  const itemCount = deleteModalState.itemsToDelete.length;
  const message = itemCount === 1
    ? sprintf(__('Are you sure you want to delete "%s"?', 'rz-file-manager'), deleteModalState.itemsToDelete[0]?.name)
    : sprintf(__('Are you sure you want to delete %d selected items?', 'rz-file-manager'), itemCount);

  /**
   * Handle confirm button click
   */
  const handleConfirm = () => {
    // Call the context function designed for deleting selected items
    handleDeleteSelectedItems();
    // This function will handle API call, loading state, and closing the modal
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
        <p>{message}</p>
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
