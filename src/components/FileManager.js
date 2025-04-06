/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
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

/**
 * FileManager component
 * 
 * This component serves as the main container for the file manager interface.
 * 
 * @return {JSX.Element} The rendered component
 */
const FileManager = () => {
  // Get state and methods from context
  const { loading, error, clearError, successMessage, clearMessages } = useFileManager();
  
  // State for modals
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState(null);

  /**
   * Open create folder modal
   */
  const openCreateFolderModal = () => {
    setIsCreateFolderModalOpen(true);
  };

  /**
   * Open rename modal
   * 
   * @param {Object} item Item to rename
   */
  const openRenameModal = (item) => {
    setItemToRename(item);
    setIsRenameModalOpen(true);
  };

  /**
   * Open delete confirmation modal
   */
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="rz-file-manager">
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
      />

      {/* Breadcrumbs */}
      <Breadcrumbs />

      {/* File List */}
      {loading ? (
        <div className="rz-file-manager__loading">
          <Spinner />
        </div>
      ) : (
        <FileList onRename={openRenameModal} />
      )}

      {/* Modals */}
      {isCreateFolderModalOpen && (
        <CreateFolderModal 
          isOpen={isCreateFolderModalOpen}
          onClose={() => setIsCreateFolderModalOpen(false)}
        />
      )}

      {isRenameModalOpen && itemToRename && (
        <RenameModal 
          isOpen={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          item={itemToRename}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      )}
    </div>
  );
};

export default FileManager;
