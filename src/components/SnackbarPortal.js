import React from 'react';
import { Snackbar } from '@wordpress/components';

/**
 * SnackbarPortal
 *
 * Renders a Snackbar in the bottom right with spacing from the edges.
 *
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {Function} props.onRemove - Handler for dismissing the snackbar
 * @param {React.ReactNode} [props.children] - Optional custom content
 */
const SnackbarPortal = ({ message, onRemove, children }) => {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '32px',
        right: '32px',
        zIndex: 9999,
        maxWidth: '360px',
        pointerEvents: 'none', // allow click-through except snackbar
      }}
      className="rz-file-manager__snackbar-portal"
    >
      <div style={{ pointerEvents: 'auto' }}>
        {/* Only Snackbar can be interacted with */}
        {children ? (
          children
        ) : (
          <Snackbar onRemove={onRemove}>{message}</Snackbar>
        )}
      </div>
    </div>
  );
};

export default SnackbarPortal;
