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
 * DeleteConfirmationModal component
 * 
 * This component displays a modal for confirming deletion of files or folders.
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @return {JSX.Element} The rendered component
 */
const DeleteConfirmationModal = ({ isOpen, onClose }) => {
  // Get state and methods from context
  const { selectedItems, handleDeleteItems } = useFileManager();

  /**
   * Handle confirm button click
   */
  const handleConfirm = () => {
    // Delete selected items
    handleDeleteItems();
    
    // Close modal
    onClose();
  };

  /**
   * Get confirmation message based on selected items
   * 
   * @return {string} Confirmation message
   */
  const getConfirmationMessage = () => {
    const fileCount = selectedItems.filter(item => item.type !== 'directory').length;
    const folderCount = selectedItems.filter(item => item.type === 'directory').length;
    
    if (fileCount > 0 && folderCount > 0) {
      return __(
        `Are you sure you want to delete ${fileCount} file(s) and ${folderCount} folder(s)? This action cannot be undone.`,
        'rz-file-manager'
      );
    } else if (fileCount > 0) {
      return __(
        `Are you sure you want to delete ${fileCount} file(s)? This action cannot be undone.`,
        'rz-file-manager'
      );
    } else if (folderCount > 0) {
      return __(
        `Are you sure you want to delete ${folderCount} folder(s) and all their contents? This action cannot be undone.`,
        'rz-file-manager'
      );
    }
    
    return __('Are you sure you want to delete the selected items? This action cannot be undone.', 'rz-file-manager');
  };

  return (
    <Modal
      title={__('Confirm Deletion', 'rz-file-manager')}
      onRequestClose={onClose}
      className="rz-file-manager__modal"
    >
      <div className="rz-file-manager__modal-content">
        <p>{getConfirmationMessage()}</p>
        
        <ul className="rz-file-manager__delete-list">
          {selectedItems.map(item => (
            <li key={item.path}>
              <strong>{item.name}</strong>
              {item.type === 'directory' ? ` (${__('Folder', 'rz-file-manager')})` : ''}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="rz-file-manager__modal-footer">
        <Button
          variant="secondary"
          onClick={onClose}
        >
          {__('Cancel', 'rz-file-manager')}
        </Button>
        
        <Button
          variant="primary"
          onClick={handleConfirm}
          isDestructive
        >
          {__('Delete', 'rz-file-manager')}
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
