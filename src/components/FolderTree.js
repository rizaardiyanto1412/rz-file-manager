/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useCallback } from '@wordpress/element';
import { Spinner } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { useFileManager } from '../context/fileManager';
import { fetchFiles } from '../services/api';

/**
 * Custom folder tree component
 *
 * @param {Object} props Component props
 * @param {Object} props.folder Folder data
 * @param {Function} props.onFolderClick Click handler
 * @param {string} props.currentPath Current path
 * @param {number} props.level Nesting level
 * @return {JSX.Element} Rendered component
 */
import React, { memo } from 'react';

const FolderTreeItem = memo(({ folder, onFolderClick, currentPath, level = 0, isOpen, onToggle }) => {
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check if this folder is in the current path
  const isActive = currentPath === folder.path;

  // Memoized loadChildren to avoid recreation
  const loadChildren = useCallback(async () => {
    if (loaded && children.length === 0) return; // Already tried loading with no results
    if (loaded && children.length > 0) return; // Already loaded with results

    setIsLoading(true);
    try {
      const response = await fetchFiles(folder.path);
      if (response.success && response.items) {
        // Filter only folders
        const folderItems = response.items.filter(item =>
          item.type === 'folder' || item.type === 'directory'
        );
        setChildren(folderItems);
      }
      setLoaded(true);
    } catch (error) {
      console.error('Error loading folder children:', error);
    } finally {
      setIsLoading(false);
    }
  }, [folder.path, loaded, children.length]);

  // Load children for Root folder automatically on mount
  useEffect(() => {
    if (folder.path === '' && !loaded) {
      loadChildren();
    }
  }, [folder.path, loaded, loadChildren]);

  // Load children when folder is opened
  useEffect(() => {
    if (isOpen && !loaded) {
      loadChildren();
    }
  }, [isOpen, loaded, loadChildren]);

  // Memoize handleClick
  const handleClick = useCallback(() => {
    onFolderClick(folder.path);
    if (!isOpen) {
      onToggle(folder.path);
    }
  }, [onFolderClick, folder.path, isOpen, onToggle]);

  return (
    <div className="rz-folder-tree-item">
      <div
        className={`rz-folder-tree-item__header ${isActive ? 'is-active' : ''}`}
        style={{ paddingLeft: `${level * 16}px` }}
      >
        <button
          className="rz-folder-tree-item__toggle"
          onClick={() => onToggle(folder.path)}
          aria-label={isOpen ? __('Collapse folder', 'rz-file-manager') : __('Expand folder', 'rz-file-manager')}
        >
          <span className={`dashicons ${isOpen ? 'dashicons-arrow-down-alt2' : 'dashicons-arrow-right-alt2'}`}></span>
        </button>
        <div
          className="rz-folder-tree-item__name"
          onClick={handleClick}
        >
          <span className="dashicons dashicons-portfolio" style={{ color: '#f0ad4e' }}></span>
          <span className="rz-folder-tree-item__label">{folder.name}</span>
        </div>
      </div>

      {isOpen && (
        <div className="rz-folder-tree-item__children">
          {isLoading ? (
            <div className="rz-folder-tree-item__loading">
              <Spinner />
            </div>
          ) : children.length > 0 ? (
            children.map((childFolder) => (
              <FolderTreeItem
                key={childFolder.path}
                folder={childFolder}
                onFolderClick={onFolderClick}
                currentPath={currentPath}
                level={level + 1}
                isOpen={!!onToggle.openFolders[childFolder.path]}
                onToggle={onToggle}
              />
            ))
          ) : loaded ? (
            <div className="rz-folder-tree-item__empty" style={{ paddingLeft: `${(level + 1) * 16}px` }}>
              {__('No subfolders', 'rz-file-manager')}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
});

/**
 * FolderTree component
 *
 * This component displays a folder tree view for navigation.
 *
 * @return {JSX.Element} The rendered component
 */
const FolderTree = () => {
  const { currentPath, navigateTo } = useFileManager();
  const [rootFolders, setRootFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState({ '': true }); // Root open by default

  // Restore root folder loading
  useEffect(() => {
    const loadRootFolders = async () => {
      setIsLoading(true);
      try {
        // Fetch root folder data
        const response = await fetchFiles('');
        if (response.success && response.items) {
          // Use the root as a single entry point
          const rootFolder = {
            name: __('Root', 'rz-file-manager'),
            path: '',
            type: 'folder'
          };
          setRootFolders([rootFolder]);
        }
      } catch (error) {
        console.error('Error loading root folders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadRootFolders();
  }, []);

  // Helper: get all parent paths for a given path
  function getAllParentPaths(path) {
    const paths = [];
    let curr = path;
    while (curr) {
      paths.unshift(curr);
      const idx = curr.lastIndexOf('/');
      if (idx <= 0) break;
      curr = curr.slice(0, idx);
    }
    if (!paths.includes('')) paths.unshift('');
    return paths;
  }

  // Open all folders in the currentPath chain when navigation changes
  useEffect(() => {
    const paths = getAllParentPaths(currentPath);
    setOpenFolders(prev => {
      const updated = { ...prev };
      paths.forEach(p => { updated[p] = true; });
      return updated;
    });
  }, [currentPath]);

  // Toggle open/close for a folder
  const handleToggle = useCallback((path) => {
    setOpenFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  }, []);
  // Attach openFolders to handleToggle so FolderTreeItem can access it for children
  handleToggle.openFolders = openFolders;

  // Handle folder click
  const handleFolderClick = (path) => {
    navigateTo(path);
  };

  return (
    <div className="rz-file-manager__folder-tree" id="folder-tree-container">
      <h3 className="rz-file-manager__sidebar-title">{__('Folders', 'rz-file-manager')}</h3>
      {isLoading ? (
        <div className="rz-file-manager__folder-tree-loading">
          <Spinner />
        </div>
      ) : (
        <div className="rz-folder-tree">
          {rootFolders.map((folder) => (
            <FolderTreeItem
              key={folder.path}
              folder={folder}
              onFolderClick={handleFolderClick}
              currentPath={currentPath}
              level={0}
              isOpen={!!openFolders[folder.path]}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderTree;
