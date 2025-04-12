/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { FileManagerProvider } from './context/fileManager';
import FileManager from './components/FileManager';

/**
 * Main App component
 *
 * This is the entry point for our React application.
 * It wraps the FileManager component with the FileManagerProvider
 * to provide global state management.
 *
 * @return {JSX.Element} The rendered component
 */
const App = () => {
  return (
    <FileManagerProvider>
      <div className="rz-file-manager-app">
        <FileManager />
      </div>
    </FileManagerProvider>
  );
};

export default App;
