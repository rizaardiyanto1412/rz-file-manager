import React, { useEffect, useRef, useContext } from 'react';
import { createPortal } from 'react-dom';
import { useFileManager } from '../context/FileManagerContext';
import { __ } from '@wordpress/i18n';
import { getDownloadUrl, getZipDownloadUrl } from '../services/api'; // Import download URL functions

// Helper to determine items for action (like delete, copy, cut)
const getItemsForAction = (selectedItems, rightClickedItem) => {
  const isRightClickedItemSelected = selectedItems.some(item => item.path === rightClickedItem.path);
  return isRightClickedItemSelected ? selectedItems : [rightClickedItem];
};

const ContextMenu = () => {
  const { 
    contextMenu, 
    hideContextMenu, 
    openFileEditor, 
    openRenameModal, 
    openDeleteModal,
    handleRenameItem,
    handleCreateFolder, 
    handleCreateFile,
    selectedItems, // Get selected items array
    handleCopyItems, 
    handleMoveItems, 
    handleDownloadItem, 
    handleDownloadZip, 
    handleZipItem,    
    handleUnzipItem,  
    clipboardState, // Clipboard handlers from context
    handleCutItems,
    handlePasteItems,
  } = useFileManager();
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
    if (contextMenu.item) {
      openRenameModal(contextMenu.item);
    }
    hideContextMenu(); // Close menu after action
  };

  const handleDelete = () => {
    // Determine which items to target for deletion
    const isRightClickedItemSelected = selectedItems.some(item => item.path === contextMenu.item.path);
    const itemsToDelete = isRightClickedItemSelected ? selectedItems : [contextMenu.item];

    console.log('Delete clicked. Items to target:', itemsToDelete);

    // Open the modal with the determined list of items
    openDeleteModal(itemsToDelete);

    hideContextMenu(); // Close menu after action
  };

  const handleDownload = () => {
    if (!contextMenu.item) return;

    let downloadUrl;
    if (contextMenu.item.type === 'file') {
      downloadUrl = getDownloadUrl(contextMenu.item.path);
    } else if (contextMenu.item.type === 'directory') {
      // Assuming a backend endpoint /download-zip?path=...
      downloadUrl = getZipDownloadUrl(contextMenu.item.path);
    }

    if (downloadUrl) {
      // Trigger download by navigating
      window.location.href = downloadUrl;
    }

    hideContextMenu(); // Close menu after action
  };

  const handleZip = () => {
    if (contextMenu.item) {
      console.log('Zip clicked for:', contextMenu.item.path);
      handleZipItem(contextMenu.item.path); // Call context handler
    } else {
       console.warn('Zip called with invalid selection', contextMenu.item);
       // Optionally show an error to the user
    }
    hideContextMenu();
  };

  const handleUnzip = () => {
     if (contextMenu.item && contextMenu.item.name.toLowerCase().endsWith('.zip') && contextMenu.item.type === 'file') {
       console.log('Unzip clicked for:', contextMenu.item.path);
       handleUnzipItem(contextMenu.item.path); // Call context handler
     } else {
        console.warn('Unzip called with invalid selection', contextMenu.item);
        // Optionally show an error to the user
     }
    hideContextMenu();
  };

  const handleUnzipHere = () => {
    if (contextMenu.item && contextMenu.item.name.toLowerCase().endsWith('.zip') && contextMenu.item.type === 'file') {
      console.log('Unzip Here clicked for:', contextMenu.item.path);
      // Calling the context handler we modified earlier
      handleUnzipItem(contextMenu.item.path, true); // Passing 'true' to indicate unzip here
    } else {
      console.warn('Unzip Here called with invalid selection', contextMenu.item);
    }
    hideContextMenu();
  };

  const handleCopy = () => {
    const itemsToCopy = getItemsForAction(selectedItems, contextMenu.item);
    handleCopyItems(itemsToCopy);
    hideContextMenu();
  };

  const handleCut = () => {
    const itemsToCut = getItemsForAction(selectedItems, contextMenu.item);
    handleCutItems(itemsToCut);
    hideContextMenu();
  };

  const handlePaste = () => {
    handlePasteItems();
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
          <button onClick={handleDownload}>
            <span className="dashicons dashicons-download" style={{ marginRight: '5px' }}></span> {__('Download', 'rz-file-manager')}
          </button>
        </li>
        <li>
          <button onClick={handleRename}>
            <span className="dashicons dashicons-tag" style={{ marginRight: '5px' }}></span> Rename
          </button>
        </li>
        {contextMenu.item.type === 'file' && (
          <li>
            <button onClick={handleZip}>
              <span className="dashicons dashicons-archive" style={{ marginRight: '5px' }}></span> {__('Compress to .zip', 'rz-file-manager')}
            </button>
          </li>
        )}
        {contextMenu.item.name.toLowerCase().endsWith('.zip') && contextMenu.item.type === 'file' && (
          <>
            <li>
              <button onClick={handleUnzip}>
                <span className="dashicons dashicons-unlock" style={{ marginRight: '5px' }}></span> 
                {`Extract to folder "${contextMenu.item.name.replace(/\.zip$/i, '')}"`}
              </button>
            </li>
            <li>
              <button onClick={handleUnzipHere}>
                <span className="dashicons dashicons-unlock" style={{ marginRight: '5px' }}></span> Extract here
              </button>
            </li>
          </>
        )}
        {contextMenu.item && ( // Only show copy/cut/delete if an item was clicked
          <>
            <li>
              <button onClick={handleCopy}>
                <span className="dashicons dashicons-admin-page" style={{ marginRight: '5px' }}></span> {__('Copy', 'rz-file-manager')}
              </button>
            </li>
            <li>
              <button onClick={handleCut}>
                <span className="dashicons dashicons-hammer" style={{ marginRight: '5px' }}></span> {__('Cut', 'rz-file-manager')}
              </button>
            </li>
            <li>
              <button onClick={handleDelete} style={{ color: 'red' }}>
                <span className="dashicons dashicons-trash" style={{ marginRight: '5px' }}></span> {__('Delete', 'rz-file-manager')}
              </button>
            </li>
          </>
        )}
        {/* Paste is always available but might be disabled */}
        <li> 
          <button onClick={handlePaste} disabled={!clipboardState.action}>
            <span className="dashicons dashicons-editor-paste-text" style={{ marginRight: '5px' }}></span> {__('Paste', 'rz-file-manager')}
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
