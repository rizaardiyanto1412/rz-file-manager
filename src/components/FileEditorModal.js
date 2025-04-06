/**
 * WordPress dependencies
 */
import { Modal, Button, TextareaControl, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/FileManagerContext';

/**
 * File Editor Modal Component
 * 
 * @return {JSX.Element|null} The modal component or null if not open.
 */
const FileEditorModal = () => {
  const { editorState, handleEditorContentChange, saveEditedFile, closeFileEditor } = useFileManager();

  if (!editorState.isOpen || !editorState.file) {
    return null;
  }

  return (
    <Modal
      title={sprintf(__('Editing: %s', 'rz-file-manager'), editorState.file.name)}
      onRequestClose={closeFileEditor}
      className="rz-file-manager__editor-modal"
      // Increase modal width and height for better editing experience
      // You might need to add specific CSS for this class
      // style={{ width: '80vw', height: '70vh' }} 
      // It's better to handle sizing via CSS for responsiveness
    >
      {editorState.isLoading && editorState.content === '' && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spinner />
        </div>
      )}

      {!editorState.isLoading || editorState.content !== '' ? (
        <TextareaControl
          label={__('File Content', 'rz-file-manager')}
          value={editorState.content}
          onChange={handleEditorContentChange}
          rows={20} // Adjust rows as needed
          className="rz-file-manager__editor-textarea" // Add class for styling
          disabled={editorState.isLoading}
        />
      ) : null}

      {editorState.error && (
        <p style={{ color: 'red' }}>{__('Error:', 'rz-file-manager')} {editorState.error}</p>
      )}

      <div className="rz-file-manager__modal-actions">
        <Button 
          isSecondary 
          onClick={closeFileEditor}
          disabled={editorState.isLoading}
        >
          {__('Cancel', 'rz-file-manager')}
        </Button>
        <Button 
          isPrimary 
          onClick={saveEditedFile} 
          isBusy={editorState.isLoading} // Show spinner on button when saving
          disabled={editorState.isLoading}
        >
          {__('Save Changes', 'rz-file-manager')}
        </Button>
      </div>
    </Modal>
  );
};

export default FileEditorModal;
