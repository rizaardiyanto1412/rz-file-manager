/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Modal, Button, TextControl } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element';
import { useFileManager } from '../../context/FileManagerContext';

/**
 * New File Modal Component
 */
const NewFileModal = () => {
  const {
    newFileModalState, // { isOpen }
    closeNewFileModal,
    handleCreateFile, // Function to call on submit
    loading,
    error, // Use existing error state for feedback
    setError, // Function to clear error
  } = useFileManager();

  const [filename, setFilename] = useState('');
  const [localError, setLocalError] = useState('');

  // Clear filename and local error when modal opens or closes
  useEffect(() => {
    if (newFileModalState.isOpen) {
      setFilename('');
      setLocalError(''); // Clear local validation error
      // If there's a general error from context, maybe clear it or decide how to handle
      if (error) setError(null);
    } else {
      setFilename(''); // Also clear on close just in case
      setLocalError('');
    }
  }, [newFileModalState.isOpen]);

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission
    setLocalError(''); // Clear previous local errors
    console.log("[NewFileModal] handleSubmit called"); // <<< LOG 1: Check if handler is called

    if (!filename.trim()) {
      console.log("[NewFileModal] Validation failed: Filename empty"); // <<< LOG 2a
      setLocalError(__('Filename cannot be empty.', 'rz-file-manager'));
      return;
    }
    // Basic check for common invalid characters (you might want a more robust check)
    // Escaped backslashes for the regex
    const invalidCharRegex = /[\\\\/:*?"<>|]/g;
    console.log("[NewFileModal] Checking filename against regex:", invalidCharRegex); // <<< LOG 2b
    if (invalidCharRegex.test(filename)) {
      console.log("[NewFileModal] Validation failed: Invalid characters"); // <<< LOG 2c
      setLocalError(__('Filename contains invalid characters (\\\\ / : * ? " < > |).', 'rz-file-manager'));
      return;
    }
    // Basic check for extension (encourage users to add one)
    // Escaped backslash for the dot
    console.log("[NewFileModal] Checking for extension"); // <<< LOG 2d
    if (!filename.includes('.') || filename.endsWith('.')) {
      console.log("[NewFileModal] Validation failed: Missing or invalid extension"); // <<< LOG 2e
      setLocalError(__('Please include a file extension (e.g., .txt, .html).', 'rz-file-manager'));
      return;
    }

    console.log("[NewFileModal] Validation passed. Calling handleCreateFile with:", filename.trim()); // <<< LOG 3
    // Call the context function to handle file creation
    handleCreateFile(filename.trim());
    // The context function will handle loading state, API call, success/error messages, and closing the modal
  };

  if (!newFileModalState.isOpen) {
    return null;
  }

  return (
    <Modal
      title={__('Create New File', 'rz-file-manager')}
      onRequestClose={closeNewFileModal}
      className="rz-file-manager__modal rz-file-manager__new-file-modal"
      shouldCloseOnClickOutside={!loading} // Prevent closing while loading
      shouldCloseOnEsc={!loading}
    >
      <form onSubmit={handleSubmit}>
        <div className="rz-file-manager__modal-content">
          <TextControl
            label={__('Filename (including extension)', 'rz-file-manager')}
            value={filename}
            onChange={setFilename}
            placeholder={__('e.g., document.txt, image.jpg', 'rz-file-manager')}
            // Escape backslashes in the help text example
            help={localError || __('Enter the name for the new file, including its extension.', 'rz-file-manager')}
            // Show local error state in the help text
            className={localError ? 'has-error' : ''}
            autoFocus // Focus the input field when modal opens
            disabled={loading}
            __nextHasNoMarginBottom={true}
          />
          {/* Display general errors from context if needed, though they usually appear outside modals */}
          {/* {error && <p className="rz-fm-modal-error">{error}</p>} */}
        </div>
        <div className="rz-file-manager__modal-footer">
          <Button
            variant="secondary"
            onClick={closeNewFileModal}
            disabled={loading}
          >
            {__('Cancel', 'rz-file-manager')}
          </Button>
          <Button
            variant="primary"
            type="submit" // Make this button submit the form
            isBusy={loading}
            disabled={loading || !filename.trim() || localError} // Disable if loading, empty, or local error
          >
            {loading ? __('Creating...', 'rz-file-manager') : __('Create File', 'rz-file-manager')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default NewFileModal;
