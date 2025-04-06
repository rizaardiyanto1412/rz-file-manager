import React, { useEffect, useRef } from 'react';
import { useFileManager } from '../context/FileManagerContext';

const ContextMenu = () => {
  const { contextMenu, hideContextMenu } = useFileManager();
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

  const handleActionClick = (action) => {
    console.log(`${action} clicked for:`, contextMenu.item.name);
    // Here you would call the appropriate action from context,
    // passing contextMenu.item as needed.
    // Example:
    // if (action === 'Rename') openRenameModal(contextMenu.item);
    // if (action === 'Delete') openDeleteModal([contextMenu.item]); // Assuming delete takes an array
    hideContextMenu(); // Close menu after action
  };

  const menuStyle = {
    position: 'absolute',
    top: `${contextMenu.y}px`,
    left: `${contextMenu.x}px`,
    zIndex: 1000, // Ensure it appears above other elements
    // Add basic styling (background, border, padding) via CSS later
  };

  return (
    <div ref={menuRef} className="rz-file-manager-context-menu" style={menuStyle}>
      <ul>
        <li>
          <button onClick={() => handleActionClick('Rename')}>
            <span className="dashicons dashicons-edit" style={{ marginRight: '5px' }}></span> Rename
          </button>
        </li>
        {/* Add more actions like Copy, Move, etc. */}
        <li>
          <button onClick={() => handleActionClick('Delete')} style={{ color: 'red' }}>
            <span className="dashicons dashicons-trash" style={{ marginRight: '5px' }}></span> Delete
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ContextMenu;
