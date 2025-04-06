import React, { useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useFileManager } from '../context/FileManagerContext';
import { __ } from '@wordpress/i18n';

const ContextMenu = () => {
  const { contextMenu, hideContextMenu, openFileEditor, openRenameModal, openDeleteModal } = useFileManager();
  const menuRef = useRef(null);

  // Effect to handle clicks outside the context menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        hideContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup listener on unmount or when menu visibility changes
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [contextMenu.visible, hideContextMenu]);

  if (!contextMenu.visible || !contextMenu.item) {
    return null; // Don't render if not visible or no item
  }

  const handleEdit = () => {
    if (contextMenu.item && contextMenu.item.type === 'file') {
      openFileEditor(contextMenu.item);
    }
    hideContextMenu(); // Close menu after action
  };

  const handleRename = () => {
    console.log('Rename clicked for:', contextMenu.item.name);
    if (contextMenu.item) {
      openRenameModal(contextMenu.item);
    }
    hideContextMenu(); // Close menu after action
  };

  const handleDelete = () => {
    console.log('Delete clicked for:', contextMenu.item?.name); // Optional chaining for safety
    // Currently opens a generic delete modal. Could be enhanced to pass the item.
    openDeleteModal();
    hideContextMenu();
  };

  const menuStyle = {
    position: 'absolute',
    top: `${contextMenu.y}px`,
    left: `${contextMenu.x}px`,
    zIndex: 1000, // Ensure it appears above other elements
    // Add basic styling (background, border, padding) via CSS later
  };

  const menuContent = (
    <div ref={menuRef} className="rz-file-manager-context-menu" style={menuStyle}>
      <ul>
        {contextMenu.item.type === 'file' && (
          <li>
            <button onClick={handleEdit}>
              <span className="dashicons dashicons-edit" style={{ marginRight: '5px' }}></span> {__('Edit', 'rz-file-manager')}
            </button>
          </li>
        )}
        <li>
          <button onClick={handleRename}>
            <span className="dashicons dashicons-edit" style={{ marginRight: '5px' }}></span> Rename
          </button>
        </li>
        <li>
          <button onClick={handleDelete} style={{ color: 'red' }}>
            <span className="dashicons dashicons-trash" style={{ marginRight: '5px' }}></span> Delete
          </button>
        </li>
      </ul>
    </div>
  );

  // Use createPortal to render the menu at the body level
  return createPortal(
    menuContent,
    document.body // Append to the body
  );
};

export default ContextMenu;
