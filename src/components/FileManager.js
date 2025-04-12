/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useContext, useEffect, useState } from '@wordpress/element';
import { Spinner, Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/fileManager';
import Toolbar from './Toolbar';
import Breadcrumbs from './Breadcrumbs';
import FileList from './FileList';
import FolderTree from './FolderTree';
import TestFolderTree from './TestFolderTree';
import CreateFolderModal from './Modals/CreateFolderModal';
import RenameModal from './Modals/RenameModal';
import DeleteConfirmationModal from './Modals/DeleteConfirmationModal';
import UploadModal from './Modals/UploadModal';
import NewFileModal from './Modals/NewFileModal';
import FileEditorModal from './FileEditorModal';
import ContextMenu from './ContextMenu';

/**
 * FileManager component
 *
 * This component serves as the main container for the file manager interface.
 *
 * @return {JSX.Element} The rendered component
 */
const FileManager = () => {
  // Get state and methods from context
  const {
    loading,
    error,
    successMessage,
    clearMessages,
    // Modals from context
    renameModalState,
    openRenameModal,
    closeRenameModal,
    createFolderModalState,
    openCreateFolderModal,
    closeCreateFolderModal,
    deleteModalState,
    openDeleteModal,
    closeDeleteModal,
    hideContextMenu,
    uploadModalState,
    openUploadModal,
    closeUploadModal,
  } = useFileManager();

  // State to control showing the test component
  const [showTest, setShowTest] = useState(false);

  // Click handler to close context menu
  const handleWrapperClick = () => {
    hideContextMenu();
  };

  // Toggle test component
  const toggleTest = () => {
    setShowTest(prev => !prev);
  };

  return (
    <div className="rz-file-manager" onClick={handleWrapperClick}>
      {/* Messages */}
      {error && (
        <div className="rz-file-manager__error">
          <p>{error}</p>
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {successMessage && (
        <div className="rz-file-manager__success">
          <p>{successMessage}</p>
          <button onClick={clearMessages}>×</button>
        </div>
      )}

      {/* Toolbar */}
      <Toolbar
        onCreateFolder={openCreateFolderModal}
        onDelete={openDeleteModal}
        onUpload={openUploadModal}
      />

      {/* Debug Button */}
      <div className="rz-file-manager__debug">
        <Button isSecondary onClick={toggleTest}>
          {showTest ? 'Hide Debug' : 'Show Debug'}
        </Button>
      </div>

      {/* Test Component */}
      {showTest && <TestFolderTree />}

      {/* Main Content Area with Folder Tree and File List */}
      <div className="rz-file-manager__content">
        {/* Folder Tree */}
        <div className="rz-file-manager__sidebar">
          <FolderTree />
        </div>

        {/* Main Content */}
        <div className="rz-file-manager__main">
          {/* Breadcrumbs */}
          <Breadcrumbs />

          {/* File List */}
          {loading ? (
            <div className="rz-file-manager__loading">
              <Spinner />
            </div>
          ) : (
            <FileList />
          )}
        </div>
      </div>

      {/* Modals - Use context state and functions */}
      {createFolderModalState.isOpen && (
        <CreateFolderModal
          isOpen={createFolderModalState.isOpen}
          onClose={closeCreateFolderModal}
        />
      )}

      {renameModalState.isOpen && (
        <RenameModal
          isOpen={renameModalState.isOpen}
          onClose={closeRenameModal}
          item={renameModalState.item} // Get item from context state
        />
      )}

      {deleteModalState.isOpen && (
        <DeleteConfirmationModal
          isOpen={deleteModalState.isOpen}
          onClose={closeDeleteModal}
        />
      )}

      {uploadModalState.isOpen && (
        <UploadModal
          isOpen={uploadModalState.isOpen}
          onClose={closeUploadModal}
        />
      )}

      {/* Context Menu */}
      <ContextMenu />

      {/* File Editor Modal */}
      <FileEditorModal />

      {/* New File Modal */}
      <NewFileModal />
    </div>
  );
};

export default FileManager;
