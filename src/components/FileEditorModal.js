/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Modal, Button, Spinner } from '@wordpress/components';
import { useState, useEffect } from '@wordpress/element'; // Ensure useState/useEffect are imported

/**
 * Third-party dependencies
 */
import Editor from '@monaco-editor/react'; // <-- Import Monaco Editor

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/FileManagerContext';

/**
 * Determines the Monaco language identifier from a filename.
 *
 * @param {string} filename The name of the file.
 * @returns {string} The language identifier (e.g., 'javascript', 'php', 'css') or 'plaintext'.
 */
const getLanguageFromFilename = (filename) => {
  if (!filename) return 'plaintext';
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'css':
      return 'css';
    case 'scss':
      return 'scss';
    case 'less':
      return 'less';
    case 'html':
      return 'html';
    case 'json':
      return 'json';
    case 'php':
      return 'php';
    case 'md':
      return 'markdown';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'xml':
      return 'xml';
    case 'py':
      return 'python';
    case 'sql':
      return 'sql';
    // Add more mappings as needed
    default:
      return 'plaintext';
  }
};

const FileEditorModal = () => {
  const { editorState, closeFileEditor, saveEditedFile, handleEditorContentChange } = useFileManager();

  if (!editorState.isOpen) {
    return null;
  }

  const { file, content, isLoading, error } = editorState;
  const language = getLanguageFromFilename(file?.name);

  return (
    <Modal
      title={file ? `${__('Edit File', 'rz-file-manager')}: ${file.name}` : __('Edit File', 'rz-file-manager')}
      onRequestClose={closeFileEditor}
      className="rz-file-manager-editor-modal" // Add a class for specific styling
      shouldCloseOnClickOutside={false} // Prevent closing on outside click
      isDismissible={!isLoading} // Prevent dismissing while loading/saving
    >
      {isLoading && !content && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <Spinner />
        </div>
      )}

      {!isLoading && error && (
        <div className="rz-file-manager-editor-modal__error" style={{ color: 'red', marginBottom: '1em' }}>
          <p><strong>{__('Error', 'rz-file-manager')}:</strong> {error}</p>
        </div>
      )}

      {/* Only render editor if not initial loading and no error preventing load */}
      {(!isLoading || content) && !error && (
        <Editor
          height="60vh" // Set a height for the editor
          language={language} // Set language based on file extension
          value={content} // Pass the file content
          theme="vs-light" // Use a light theme suitable for WP admin
          options={{
            lineNumbers: 'on', // Turn on line numbers
            minimap: { enabled: false }, // Disable minimap for simplicity
            wordWrap: 'on', // Enable word wrapping
            scrollBeyondLastLine: false, // Don't scroll beyond the last line
            readOnly: isLoading, // Make readonly while saving
          }}
          onChange={handleEditorContentChange} // Handle content changes
          onMount={(editor, monaco) => {
            // You can access the editor instance here if needed
            // e.g., editor.focus();
          }}
        />
      )}

      <div className="rz-file-manager-editor-modal__actions" style={{ marginTop: '1em', display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          isSecondary 
          onClick={closeFileEditor}
          disabled={isLoading}
          style={{ marginRight: '8px' }}
        >
          {__('Cancel', 'rz-file-manager')}
        </Button>
        <Button 
          isPrimary 
          onClick={saveEditedFile}
          isBusy={isLoading} // Show spinner on button when saving
          disabled={isLoading || !!error} // Disable if loading or there was a load error
        >
          {__('Save Changes', 'rz-file-manager')}
        </Button>
      </div>
    </Modal>
  );
};

export default FileEditorModal;
