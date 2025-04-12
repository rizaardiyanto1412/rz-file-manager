/**
 * WordPress dependencies
 */
import { useContext } from '@wordpress/element';

/**
 * Internal dependencies
 */
import FileManagerContext from './FileManagerContext';

/**
 * Custom hook to use the FileManagerContext
 * 
 * @return {Object} The context value
 */
export const useFileManager = () => useContext(FileManagerContext);
