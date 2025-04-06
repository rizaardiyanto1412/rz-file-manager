/**
 * WordPress dependencies
 */
import apiFetch from '@wordpress/api-fetch';

/**
 * Relative base path for the REST API endpoints
 */
const API_BASE_PATH = '/rz-file-manager/v1'; // Path relative to /wp-json/

/**
 * Fetch files and folders from a directory
 * 
 * @param {string} path Directory path
 * @return {Promise<Object>} API response
 */
export const fetchFiles = async (path = '') => {
  try {
    console.log('fetchFiles called with path:', path);
    console.log('rzFileManager object:', window.rzFileManager);

    // Construct the full URL for the standard fetch call
    const listUrl = `${window.rzFileManager?.restUrl}list`; // Note: restUrl already includes the base path and slash
    console.log('Attempting standard fetch with URL:', listUrl);

    // --- Using standard fetch instead ---
    const response = await fetch(`${listUrl}?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      credentials: 'include', // Send cookies
      headers: {
        'X-WP-Nonce': window.rzFileManager?.nonce,
        'Content-Type': 'application/json' // Though GET usually doesn't need this, good practice
      },
    });

    if (!response.ok) {
      // Throw an error with status if response is not OK
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json(); // Parse JSON response
    return data; // Return the parsed data

  } catch (error) {
    // Log the more specific error
    console.error('Error in fetchFiles (standard fetch):', error);
    // Return a consistent error structure
    return { success: false, message: error.message };
  }
};

/**
 * Create a new folder
 * 
 * @param {string} path Parent directory path
 * @param {string} name Folder name
 * @return {Promise<Object>} API response
 */
export const createFolder = async (path, name) => {
  try {
    const response = await apiFetch({
      path: `${API_BASE_PATH}/create-folder`,
      method: 'POST',
      data: { path, name },
    });
    return response;
  } catch (error) {
    console.error('Error creating folder:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Upload a file
 * 
 * @param {string} path Directory path
 * @param {File} file File to upload
 * @return {Promise<Object>} API response
 */
export const uploadFile = async (path, file) => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', path);
    
    // Construct the full URL for fetch, as apiFetch doesn't handle FormData well
    const uploadUrl = `${window.rzFileManager?.restUrl || '/wp-json' + API_BASE_PATH}/upload`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'X-WP-Nonce': window.rzFileManager?.nonce,
      },
      body: formData,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Delete a file or folder
 * 
 * @param {string} path Path to delete
 * @return {Promise<Object>} API response
 */
export const deleteItem = async (path) => {
  try {
    const response = await apiFetch({
      path: `${API_BASE_PATH}/delete`,
      method: 'DELETE',
      data: { path },
    });
    return response;
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Rename a file or folder
 * 
 * @param {string} path Path to rename
 * @param {string} newName New name
 * @return {Promise<Object>} API response
 */
export const renameItem = async (path, newName) => {
  try {
    const response = await apiFetch({
      path: `${API_BASE_PATH}/rename`,
      method: 'POST',
      data: { path, newName },
    });
    return response;
  } catch (error) {
    console.error('Error renaming item:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Copy a file or folder
 * 
 * @param {string} source Source path
 * @param {string} destination Destination path
 * @return {Promise<Object>} API response
 */
export const copyItem = async (source, destination) => {
  try {
    const response = await apiFetch({
      path: `${API_BASE_PATH}/copy`,
      method: 'POST',
      data: { source, destination },
    });
    return response;
  } catch (error) {
    console.error('Error copying item:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Move a file or folder
 * 
 * @param {string} source Source path
 * @param {string} destination Destination path
 * @return {Promise<Object>} API response
 */
export const moveItem = async (source, destination) => {
  try {
    const response = await apiFetch({
      path: `${API_BASE_PATH}/move`,
      method: 'POST',
      data: { source, destination },
    });
    return response;
  } catch (error) {
    console.error('Error moving item:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Fetch file content.
 * 
 * @param {string} pathParam Path to the file.
 * @return {Promise<Object>} API response.
 */
export const getFileContent = async (pathParam) => {
  // Manually construct the URL with the query parameter
  const urlWithPath = `${API_BASE_PATH}/get-content?path=${encodeURIComponent(pathParam)}`;

  try {
    const response = await apiFetch({
      path: urlWithPath,
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error getting file content:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Save file content.
 * 
 * @param {string} path Path to the file.
 * @param {string} content File content.
 * @return {Promise<Object>} API response.
 */
export const saveFileContent = async (path, content) => {
  try {
    const response = await apiFetch({
      path: `${API_BASE_PATH}/save-content`,
      method: 'POST',
      data: { path, content },
    });
    return response;
  } catch (error) {
    console.error('Error saving file content:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get download URL for a file
 * 
 * @param {string} path File path
 * @return {string} Download URL
 */
export const getDownloadUrl = (path) => {
  // Construct the full URL for download link
  const downloadUrlBase = window.rzFileManager?.restUrl || '/wp-json' + API_BASE_PATH;
  return `${downloadUrlBase}/download?path=${encodeURIComponent(path)}&_wpnonce=${window.rzFileManager?.nonce}`;
};
