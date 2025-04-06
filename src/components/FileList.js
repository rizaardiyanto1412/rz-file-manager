/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/FileManagerContext';
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
  const { items, currentPath } = useFileManager();

  // If there are no items, show a message
  if (items.length === 0) {
    return (
      <div className="rz-file-manager__empty">
        <p>{__('This folder is empty.', 'rz-file-manager')}</p>
      </div>
    );
  }

  return (
    <div className="rz-file-manager__file-list">
      <table className="rz-file-manager__table">
        <thead>
          <tr>
            <th className="rz-file-manager__table-checkbox">
              <span className="screen-reader-text">{__('Select', 'rz-file-manager')}</span>
            </th>
            <th className="rz-file-manager__table-name">{__('Name', 'rz-file-manager')}</th>
            <th className="rz-file-manager__table-size">{__('Size', 'rz-file-manager')}</th>
            <th className="rz-file-manager__table-modified">{__('Modified', 'rz-file-manager')}</th>
            <th className="rz-file-manager__table-actions">{__('Actions', 'rz-file-manager')}</th>
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
