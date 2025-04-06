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

    // Construct the full URL for the standard fetch call
    const listUrl = `${window.rzFileManagerData?.restUrl}list`; // Note: restUrl already includes the base path and slash

    // --- Using standard fetch instead ---
    const response = await fetch(`${listUrl}?path=${encodeURIComponent(path)}`, {
      method: 'GET',
      credentials: 'include', // Send cookies
      headers: {
        'X-WP-Nonce': window.rzFileManagerData?.restNonce, // Use the REST nonce
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
    // Use 'current_path' to match the backend parameter name more explicitly
    formData.append('current_path', path);
    

    // Define API_BASE_PATH if not already globally available (adjust if needed)
    const API_BASE_PATH = 'rz-file-manager/v1';

    // Determine the base URL, ensuring it doesn't end with a slash
    let baseUrl = window.rzFileManagerData?.restUrl || `/wp-json/${API_BASE_PATH}`;
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1); // Remove trailing slash if present
    }

    // Construct the final URL ensuring only one slash before 'upload'
    const uploadUrl = `${baseUrl}/upload`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        // Ensure you're using the correct nonce if localized
        'X-WP-Nonce': window.rzFileManagerData?.nonce || window.rzFileManagerData?.restNonce,
      },
      body: formData,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    // Check if the response object exists in the error (e.g., for network errors vs HTTP errors)
    let message = 'Network error during upload';
    if (error.response) {
        // Try to get message from potential JSON error response
        try {
            const errorData = await error.response.json();
            message = errorData.message || error.response.statusText;
        } catch (parseError) {
            message = error.response.statusText;
        }
    } else if (error.message) {
         message = error.message;
    }
    return { success: false, message };
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
      // Use the parameter name expected by the backend API ('new_name')
      data: { path, new_name: newName }, 
    });
    return response;
  } catch (error) {
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
    return { success: false, message: error.message };
  }
};

/**
 * Get the direct download URL for a file.
 * 
 * @param {string} path File path.
 * @return {string} The download URL.
 */
export const getDownloadUrl = (path) => {
  // Construct the URL for the admin-ajax.php endpoint
  const ajaxUrl = window.rzFileManagerData?.ajaxUrl;
  const nonce = window.rzFileManagerData?.ajaxNonce; // Use the specific AJAX nonce
  
  // Append necessary parameters for the AJAX handler
  // Path is passed directly, PHP handler will validate
  return `${ajaxUrl}?action=rz_fm_download_item&path=${path}&_wpnonce=${nonce}`;
};

/**
 * Get the download URL for a zipped directory.
 * 
 * @param {string} path Directory path.
 * @return {string} The zip download URL.
 */
export const getZipDownloadUrl = (path) => {
  // Construct the URL for the admin-ajax.php endpoint
  const ajaxUrl = window.rzFileManagerData?.ajaxUrl;
  const nonce = window.rzFileManagerData?.ajaxNonce; // Use the specific AJAX nonce

  // Append necessary parameters for the AJAX handler
  // Path is passed directly, PHP handler will validate
  return `${ajaxUrl}?action=rz_fm_download_zip&path=${path}&_wpnonce=${nonce}`;
};

/**
 * Get download URL for a file
 * 
 * @param {string} path File path
 * @return {string} Download URL
 */
export const getDownloadUrlLegacy = (path) => {
  // Construct the full URL for download link
  const downloadUrlBase = window.rzFileManagerData?.restUrl || '/wp-json' + API_BASE_PATH;
  return `${downloadUrlBase}/download?path=${encodeURIComponent(path)}&_wpnonce=${window.rzFileManagerData?.restNonce}`; // Use restNonce
};

/**
 * Creates a new empty file.
 * 
 * @param {string} path The directory path where the file should be created.
 * @param {string} filename The name of the file to create (including extension).
 * @returns {Promise<object>} Promise resolving to the API response.
 */
export const createFile = async (path, filename) => {
  // Corrected URL construction: Use restUrl directly and append endpoint name without leading slash
  const url = `${window.rzFileManagerData?.restUrl}create-file`; 
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-WP-Nonce': window.rzFileManagerData?.restNonce,
    },
    body: JSON.stringify({ path, filename }), // Send path and filename
  });

  if (!response.ok) {
    // Try to parse error message from response, otherwise use status text
    let errorMessage = `HTTP error! status: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage; // Use message from body if available
    } catch (e) {
      // Ignore if response body is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json(); // Return the success response body
};

/**
 * Create a zip archive of an item
 * 
 * @param {string} path Path to the item
 * @return {Promise<Object>} API response
 */
export const zipItem = async (path) => {
  const url = `${window.rzFileManagerData?.restUrl}zip`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.rzFileManagerData?.restNonce,
      },
      body: JSON.stringify({ path }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      const errorCode = data.code || 'zip_failed';
      // Throw an error object compatible with how other errors are handled
      throw { code: errorCode, message: errorMessage, data: data.data || null };
    }

    return data; // Should contain { success: true, message: '...' }
  } catch (error) {
    console.error('Error zipping item:', error);
    // Re-throw the error object or a new one if needed
    throw error;
  }
};

/**
 * Unzip an archive
 * 
 * @param {string} path Path to the archive
 * @param {boolean} [unzipHere=false] Optional. If true, unzip directly into the current directory.
 * @return {Promise<Object>} API response
 */
export const unzipItem = async (path, unzipHere = false) => {
  const url = `${window.rzFileManagerData?.restUrl}unzip`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': window.rzFileManagerData?.restNonce,
      },
      body: JSON.stringify({ path, unzipHere }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || `HTTP error! status: ${response.status}`;
      const errorCode = data.code || 'unzip_failed';
      // Throw an error object compatible with how other errors are handled
      throw { code: errorCode, message: errorMessage, data: data.data || null };
    }

    return data; // Should contain { success: true, message: '...' }
  } catch (error) {
    console.error('Error unzipping item:', error);
    // Re-throw the error object or a new one if needed
    throw error;
  }
};

// Copy an item (file or directory)
export const copyItem = async (source, destination) => apiFetch({
  path: API_BASE_PATH + '/copy',
  method: 'POST',
  data: { source, destination }
});

// Move an item (file or directory) - used for Cut/Paste
export const moveItem = async (source, destination) => apiFetch({
  path: API_BASE_PATH + '/move',
  method: 'POST',
  data: { source, destination }
});
