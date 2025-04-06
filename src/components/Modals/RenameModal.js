/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Modal, Button, TextControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../../context/FileManagerContext';

/**
 * RenameModal component
 * 
 * This component displays a modal for renaming a file or folder.
 * 
 * @param {Object} props Component props
 * @param {boolean} props.isOpen Whether the modal is open
 * @param {Function} props.onClose Function to close the modal
 * @param {Object} props.item Item to rename
 * @return {JSX.Element} The rendered component
 */
const RenameModal = ({ isOpen, onClose, item }) => {
  // Get state and methods from context
  const { handleRenameItem } = useFileManager();
  
  // State for new name
  const [newName, setNewName] = useState('');
  
  // State for validation error
  const [error, setError] = useState('');

  // Set initial name when item changes
  useEffect(() => {
    if (item) {
      setNewName(item.name);
    }
  }, [item]);

  /**
   * Handle form submission
   * 
   * @param {Event} event Submit event
   */
  const handleSubmit = (event) => {
    event.preventDefault();
    
    // Validate new name
    if (!newName) {
      setError(__('Please enter a name.', 'rz-file-manager'));
      return;
    }
    
    // Check for invalid characters
    if (/[\\/:*?"<>|]/.test(newName)) {
      setError(__('Name contains invalid characters.', 'rz-file-manager'));
      return;
    }
    
    // If name hasn't changed, just close the modal
    if (newName === item.name) {
      onClose();
      return;
    }
    
    // Rename item
    handleRenameItem(item.path, newName);
    
    // Close modal
    onClose();
  };

  /**
   * Handle name change
   * 
   * @param {string} value New name
   */
  const handleNameChange = (value) => {
    setNewName(value);
    setError('');
  };

  return (
    <Modal
      title={__('Rename', 'rz-file-manager')}
      onRequestClose={onClose}
      className="rz-file-manager__modal"
    >
      <form onSubmit={handleSubmit}>
        <div className="rz-file-manager__modal-content">
          <p>
            {item && item.type === 'directory'
              ? __('Rename folder:', 'rz-file-manager')
              : __('Rename file:', 'rz-file-manager')
            }
            <strong>{item ? item.name : ''}</strong>
          </p>
          
          <TextControl
            label={__('New Name', 'rz-file-manager')}
            value={newName}
            onChange={handleNameChange}
            placeholder={__('Enter new name', 'rz-file-manager')}
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
            {__('Rename', 'rz-file-manager')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RenameModal;
