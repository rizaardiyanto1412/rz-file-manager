/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/FileManagerContext';
import { getDownloadUrl } from '../services/api';
import { formatFileSize, formatDate } from '../utils/formatters';

/**
 * FileItem component
 * 
 * This component displays a single file or folder in the file list.
 * 
 * @param {Object} props Component props
 * @param {Object} props.item File or folder item
 * @param {Function} props.onRename Function to open rename modal
 * @return {JSX.Element} The rendered component
 */
const FileItem = ({ item, onRename }) => {
  // Get state and methods from context
  const { 
    navigateTo, 
    toggleSelectItem, 
    isItemSelected,
    showContextMenu,
    handleDeleteItems,
    openFileEditor, // Import openFileEditor from context
  } = useFileManager();

  /**
   * Handle item click
   * 
   * @param {Event} event Click event
   */
  const handleItemClick = (event) => {
    // Check if shift or ctrl/cmd key is pressed for multi-select
    const isShiftPressed = event.shiftKey;
    const isCtrlCmdPressed = event.ctrlKey || event.metaKey; // metaKey for Mac Command

    toggleSelectItem(item, isShiftPressed, isCtrlCmdPressed);
  };

  /**
   * Handle double click
   * 
   * @param {Event} event Double click event
   */
  const handleDoubleClick = () => {
    if (item.type === 'directory') {
      navigateTo(item.path);
    } else if (item.type === 'file') { // Call openFileEditor for files
      openFileEditor(item);
    }
  };

  /**
   * Handle right click (context menu)
   * 
   * @param {Event} event Context menu event
   */
  const handleContextMenu = (event) => {
    event.preventDefault(); // Prevent default browser context menu
    showContextMenu(item, event);
  };

  /**
   * Handle checkbox change
   * 
   * @param {Event} event Change event
   */
  const handleCheckboxChange = (event) => {
    event.stopPropagation();
    toggleSelectItem(item);
  };

  /**
   * Handle rename button click
   * 
   * @param {Event} event Click event
   */
  const handleRenameClick = (event) => {
    event.stopPropagation();
    onRename(item);
  };

  /**
   * Handle delete button click
   * 
   * @param {Event} event Click event
   */
  const handleDeleteClick = (event) => {
    event.stopPropagation();
    toggleSelectItem(item);
    handleDeleteItems();
  };

  /**
   * Get icon based on item type and extension
   * 
   * @return {string} Dashicon name
   */
  const getItemIcon = () => {
    if (item.type === 'directory') {
      return 'portfolio'; // Using portfolio as folder icon
    }

    // Determine icon based on file extension
    const extension = item.name.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'format-image';
      case 'pdf':
        return 'media-document';
      case 'doc':
      case 'docx':
        return 'media-text'; // Could use a more specific one if available
      case 'xls':
      case 'xlsx':
        return 'media-spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'media-interactive'; // Or media-presentation if WP adds one
      case 'zip':
      case 'rar':
      case '7z':
        return 'portfolio'; // Re-using portfolio for archives
      case 'txt':
      case 'md':
        return 'text-page';
      default:
        return 'media-default'; // Generic file icon
    }
  };

  return (
    <tr
      className={`rz-file-manager__file-item ${isItemSelected(item) ? 'is-selected' : ''}`}
      onClick={handleItemClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <td className="rz-file-manager__table-checkbox">
        <input
          type="checkbox"
          checked={isItemSelected(item)}
          onChange={(e) => {
            e.stopPropagation(); // Prevent row click when clicking checkbox
            handleCheckboxChange(e);
          }}
          aria-label={`Select ${item.name}`}
        />
      </td>
      <td className="rz-file-manager__table-name">
        <span className={`dashicons dashicons-${getItemIcon()}`} style={{ marginRight: '8px', verticalAlign: 'middle' }}></span>
        {item.name}
      </td>
      <td className="rz-file-manager__table-size">
        {item.type === 'directory' ? '-' : formatFileSize(item.size)}
      </td>
      <td className="rz-file-manager__table-modified">
        {formatDate(item.modified)}
      </td>
    </tr>
  );
};

export default FileItem;
