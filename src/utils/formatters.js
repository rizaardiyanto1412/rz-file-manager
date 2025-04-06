/**
 * Format file size
 * 
 * @param {number} bytes File size in bytes
 * @param {number} decimals Number of decimal places
 * @return {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
    if (bytes === 0 || typeof bytes !== 'number') return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    // Ensure the index doesn't go out of bounds for extremely large numbers
    const sizeIndex = i < sizes.length ? i : sizes.length - 1;

    return parseFloat((bytes / Math.pow(k, sizeIndex)).toFixed(dm)) + ' ' + sizes[sizeIndex];
};

/**
 * Format date
 * 
 * @param {number} timestamp Unix timestamp
 * @return {string} Formatted date
 */
export const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp !== 'number') return '-'; // Handle invalid timestamps
    try {
        const date = new Date(timestamp * 1000);
        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        // Use locale-specific formatting
        return date.toLocaleString(undefined, { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit' 
        });
    } catch (e) {
        return 'Error'; // Return error indication
    }
};
