/**
 * Initial state for the FileManagerContext
 */
export const initialState = {
  // Core state
  currentPath: '',
  items: [],
  selectedItems: [],
  loading: false,
  error: null,
  successMessage: null,
  uploadError: null,

  // Sorting state
  sortKey: 'name',
  sortDirection: 'asc',

  // Context menu state
  contextMenu: { 
    visible: false, 
    x: 0, 
    y: 0, 
    item: null 
  },

  // File Editor Modal state
  editorState: {
    isOpen: false,
    file: null,
    content: '',
    isLoading: false,
    error: null,
  },

  // Rename Modal state
  renameModalState: {
    isOpen: false,
    item: null,
  },

  // Create Folder Modal state
  createFolderModalState: { 
    isOpen: false 
  },

  // Delete Confirmation Modal state
  deleteModalState: { 
    isOpen: false, 
    itemsToDelete: [] 
  },

  // Upload Modal state
  uploadModalState: { 
    isOpen: false 
  },

  // New File Modal state
  newFileModalState: { 
    isOpen: false 
  },

  // Clipboard state
  clipboardState: { 
    action: null, 
    items: [] 
  },
};
