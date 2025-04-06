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
    handleDeleteItems,
  } = useFileManager();

  /**
   * Format file size
   * 
   * @param {number} bytes File size in bytes
   * @return {string} Formatted file size
   */
  const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  /**
   * Format date
   * 
   * @param {number} timestamp Unix timestamp
   * @return {string} Formatted date
   */
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString();
  };

  /**
   * Handle item click
   * 
   * @param {Event} event Click event
   */
  const handleItemClick = (event) => {
    // If it's a directory, navigate to it
    if (item.type === 'directory') {
      navigateTo(item.path);
    }
  };

  /**
   * Handle double click
   * 
   * @param {Event} event Double click event
   */
  const handleDoubleClick = () => {
    if (item.type === 'directory') {
      navigateTo(item.path);
    }
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
   * Get item icon based on type
   * 
   * @return {string} Dashicon name
   */
  const getItemIcon = () => {
    if (item.type === 'directory') {
      return 'portfolio';
    }
    
    // Determine icon based on file extension
    const extension = item.name.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        return 'format-image';
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'media-document';
      case 'xls':
      case 'xlsx':
        return 'media-spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'media-interactive';
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
        return 'archive';
      case 'txt':
      case 'md':
        return 'media-text';
      case 'php':
      case 'js':
      case 'css':
      case 'html':
        return 'editor-code';
      default:
        return 'media-default';
    }
  };

  return (
    <tr 
      className={`rz-file-manager__file-item ${isItemSelected(item) ? 'is-selected' : ''}`}
      onClick={handleItemClick}
      onDoubleClick={handleDoubleClick}
    >
      <td className="rz-file-manager__table-checkbox">
        <input 
          type="checkbox" 
          checked={isItemSelected(item)}
          onChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="rz-file-manager__table-name">
        <span className={`dashicons dashicons-${getItemIcon()}`} style={{ marginRight: '8px', verticalAlign: 'middle' }}></span>
        {item.name}
      </td>
      <td className="rz-file-manager__table-size">
        {item.type === 'directory' ? '--' : formatFileSize(item.size)}
      </td>
      <td className="rz-file-manager__table-modified">
        {formatDate(item.modified)}
      </td>
      <td className="rz-file-manager__table-actions">
        {item.type !== 'directory' && (
          <a 
            href={getDownloadUrl(item.path)}
            className="button button-small"
            onClick={(e) => e.stopPropagation()}
            download
          >
            {__('Download', 'rz-file-manager')}
          </a>
        )}
        <Button 
          isSmall
          onClick={handleRenameClick}
        >
          {__('Rename', 'rz-file-manager')}
        </Button>
        <Button 
          isSmall
          isDestructive
          onClick={handleDeleteClick}
        >
          {__('Delete', 'rz-file-manager')}
        </Button>
      </td>
    </tr>
  );
};

export default FileItem;
