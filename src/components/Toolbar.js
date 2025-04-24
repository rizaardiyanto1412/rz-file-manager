/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/fileManager';

/**
 * Toolbar component
 *
 * This component renders the toolbar with action buttons for the file manager.
 *
 * @param {Object} props Component props
 * @param {Function} props.onCreateFolder Function to open create folder modal
 * @param {Function} props.onUpload Function to open upload modal
 * @return {JSX.Element} The rendered component
 */
const Toolbar = () => {
  // Get state and methods from context
  const {
    selectedItems,
    navigateToParent,
    loadItems,
    currentPath,
    openCreateFolderModal,
    openUploadModal,
    openNewFileModal,
    loading,
  } = useFileManager();

  /**
   * Handle refresh button click
   */
  const handleRefresh = () => {
    loadItems();
  };

  /**
   * Handle parent directory button click
   */
  const handleParentDirectory = () => {
    navigateToParent();
  };

  const hasSelection = selectedItems.length > 0;

  return (
    <div className="rz-file-manager__toolbar">
      <div className="rz-file-manager__toolbar-left">
        <Button
          variant="secondary"
          onClick={handleParentDirectory}
          icon="arrow-up-alt2"
          disabled={!currentPath}
          className="rz-file-manager__toolbar-button"
        >
          {__('Parent Directory', 'rz-file-manager')}
        </Button>

        <Button
          variant="secondary"
          onClick={handleRefresh}
          icon="update"
          className="rz-file-manager__toolbar-button"
        >
          {__('Refresh', 'rz-file-manager')}
        </Button>
      </div>

      
    </div>
  );
};

export default Toolbar;
