/**
 * WordPress dependencies
 */
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import App from './App';
import { FileManagerProvider } from './context/FileManagerContext';
import './styles/main.css';

/**
 * Render the App component into the DOM
 */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('rz-file-manager-root');
  if (container) {
    render(
      <FileManagerProvider>
        <App />
      </FileManagerProvider>,
      container
    );
  }
});
