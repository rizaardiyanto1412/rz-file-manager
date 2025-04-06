/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useContext, useEffect } from '@wordpress/element';
import { Spinner } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/FileManagerContext';
import Toolbar from './Toolbar';
import Breadcrumbs from './Breadcrumbs';
import FileList from './FileList';
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

  // Click handler to close context menu
  const handleWrapperClick = () => {
    hideContextMenu();
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
