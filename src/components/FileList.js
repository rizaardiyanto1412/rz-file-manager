/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import React from 'react';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/fileManager';
import FileItem from './FileItem';

/**
 * FileList component
 *
 * This component displays the list of files and folders in the current directory.
 *
 * @param {Object} props Component props
 * @param {Function} props.onRename Function to open rename modal
 * @return {JSX.Element} The rendered component
 */
const FileList = ({ onRename }) => {
  // Get state and methods from context
  const {
    items,
    sortKey,
    sortDirection,
    setSort,
    toggleSelectAll,      // <-- Get function from context
    areAllItemsSelected,  // <-- Get state from context
    selectedItems       // <-- Get selectedItems to disable if none visible
  } = useFileManager();

  // If there are no items, show a message
  if (items.length === 0) {
    return (
      <div className="rz-file-manager__empty">
        <span className="dashicons dashicons-portfolio"></span>
        <p>{__('This folder is empty.', 'rz-file-manager')}</p>
        <p className="rz-file-manager__empty-hint">{__('Upload files or create a new folder to get started.', 'rz-file-manager')}</p>
      </div>
    );
  }

  const handleSort = (key) => {
    setSort(key);
  };

  // Helper to generate sort indicator (arrow)
  const getSortIndicator = (key) => {
    if (sortKey !== key) {
      return null; // No indicator if not the active sort column
    }
    // Use Dashicons for up/down arrows
    const iconClass = sortDirection === 'asc'
      ? 'dashicons dashicons-arrow-up-alt2'
      : 'dashicons dashicons-arrow-down-alt2';
    return <span className={iconClass} style={{ marginLeft: '5px' }}></span>;
  };

  return (
    <div className="rz-file-manager__file-list">
      <table className="rz-file-manager__table">
        <thead className="rz-file-manager__table-head">
          <tr onClick={(e) => e.stopPropagation()}> {/* Prevent triggering row clicks */}
            <th className="rz-file-manager__table-checkbox">
              {/* Add Select All Checkbox */}
              <input
                type="checkbox"
                aria-label={__('Select all items', 'rz-file-manager')}
                checked={areAllItemsSelected} // <-- Use state from context
                onChange={toggleSelectAll}    // <-- Use function from context
                disabled={items.length === 0} // <-- Disable if no items
              />
            </th>
            <th className="rz-file-manager__table-name" onClick={() => handleSort('name')}>
              {__('Name', 'rz-file-manager')}
              {getSortIndicator('name')}
            </th>
            <th className="rz-file-manager__table-size" onClick={() => handleSort('size')}>
              {__('Size', 'rz-file-manager')}
              {getSortIndicator('size')}
            </th>
            <th className="rz-file-manager__table-modified" onClick={() => handleSort('modified')}>
              {__('Modified', 'rz-file-manager')}
              {getSortIndicator('modified')}
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <FileItem
              key={item.path}
              item={item}
              onRename={onRename}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
