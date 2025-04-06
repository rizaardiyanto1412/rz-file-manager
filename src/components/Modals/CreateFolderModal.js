/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Modal, Button, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../../context/FileManagerContext';

/**
 * CreateFolderModal component
 * 
 * This component displays a modal for creating a new folder.
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @return {JSX.Element} The rendered component
 */
const CreateFolderModal = ({ isOpen, onClose }) => {
  // Get state and methods from context
  const { currentPath, handleCreateFolder } = useFileManager();
  
  // State for folder name
  const [folderName, setFolderName] = useState('');
  
  // State for validation error
  const [error, setError] = useState('');

  /**
   * Handle form submission
   * 
   * @param {Event} event Submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate folder name
    if (!folderName) {
      setError(__('Please enter a folder name.', 'rz-file-manager'));
      return;
    }
    
    // Check for invalid characters
    if (/[\\/:*?"<>|]/.test(folderName)) {
      setError(__('Folder name contains invalid characters.', 'rz-file-manager'));
      return;
    }
    
    // Create folder
    handleCreateFolder(folderName);
    
    // Close modal
    onClose();
  };

  /**
   * Handle folder name change
   * 
   * @param {string} value New folder name
   */
  const handleFolderNameChange = (value) => {
    setFolderName(value);
    setError('');
  };

  return (
    <Modal
      title={__('Create New Folder', 'rz-file-manager')}
      onRequestClose={onClose}
      className="rz-file-manager__modal"
    >
      <form onSubmit={handleSubmit}>
        <div className="rz-file-manager__modal-content">
          <p>
            {__('Create a new folder in:', 'rz-file-manager')}
            <strong>{currentPath || '/'}</strong>
          </p>
          
          <TextControl
            label={__('Folder Name', 'rz-file-manager')}
            value={folderName}
            onChange={handleFolderNameChange}
            placeholder={__('Enter folder name', 'rz-file-manager')}
            autoFocus
          />
          
          {error && (
            <div className="rz-file-manager__modal-error">
              {error}
            </div>
          )}
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
            type="submit"
          >
            {__('Create Folder', 'rz-file-manager')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateFolderModal;
