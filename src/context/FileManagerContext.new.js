/**
 * WordPress dependencies
 */
import { createContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { FileManagerProvider, useFileManager } from './fileManager/index';

// Re-export the context, provider, and hook from the refactored structure
const FileManagerContext = createContext();

export { FileManagerProvider, useFileManager };
export default FileManagerContext;
