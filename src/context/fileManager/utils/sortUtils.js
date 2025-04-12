/**
 * Sort items based on key and direction
 * Folders always come before files
 * 
 * @param {Array} itemsToSort Items to sort
 * @param {string} key Sort key ('name', 'size', 'modified')
 * @param {string} direction Sort direction ('asc', 'desc')
 * @return {Array} Sorted items
 */
export const sortItems = (itemsToSort, key, direction) => {
  return [...itemsToSort].sort((a, b) => {
    // Always sort directories before files
    if (a.type === 'directory' && b.type !== 'directory') return -1;
    if (a.type !== 'directory' && b.type === 'directory') return 1;

    let comparison = 0;
    if (key === 'name') {
      comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    } else if (key === 'size') {
      // Treat directories as having size -1 for sorting purposes if needed,
      // but the primary directory check handles most cases.
      const sizeA = a.type === 'directory' ? -1 : a.size;
      const sizeB = b.type === 'directory' ? -1 : b.size;
      comparison = sizeA - sizeB;
    } else if (key === 'modified') {
      comparison = a.modified - b.modified;
    }

    return direction === 'asc' ? comparison : comparison * -1;
  });
};
