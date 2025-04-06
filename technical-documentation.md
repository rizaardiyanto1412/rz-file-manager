# RZ File Manager - Technical Documentation

## Overview

RZ File Manager is a modern WordPress plugin that provides a user-friendly interface for managing files directly within the WordPress admin area. Unlike traditional file manager plugins that use older technologies, RZ File Manager leverages React for a responsive, dynamic user interface while maintaining a secure PHP backend through WordPress REST API.

## Tech Stack

### Backend

- **PHP 7.4+**: Core language for WordPress plugin development
- **WordPress REST API**: For creating secure endpoints to handle file operations
- **WordPress Filesystem API**: For safe file system operations
- **WordPress Hooks System**: For integrating with WordPress core

### Frontend

- **React 18**: For building the user interface
- **@wordpress/scripts**: For WordPress-compatible build process
- **CSS Modules**: For component-scoped styling
- **React Context API**: For state management
- **React Router**: For client-side navigation (optional)

### Development Tools

- **Node.js & npm**: For managing JavaScript dependencies
- **ESLint & Prettier**: For code quality and formatting
- **Webpack** (via @wordpress/scripts): For bundling JavaScript
- **Babel** (via @wordpress/scripts): For JavaScript transpilation
- **SASS/SCSS**: For enhanced styling capabilities

## Architecture

### Directory Structure

```
rz-file-manager/
│
├── rz-file-manager.php            # Main plugin file
├── uninstall.php                  # Clean up on uninstall
│
├── includes/                      # PHP backend code
│   ├── class-rz-file-manager.php  # Main plugin class
│   ├── class-rest-api.php         # REST API registration
│   ├── class-filesystem.php       # File system operations
│   ├── class-admin.php            # Admin page setup
│   └── class-assets.php           # Asset management
│
├── src/                           # React source code
│   ├── index.js                   # Entry point
│   ├── App.js                     # Main React component
│   ├── context/                   # React Context providers
│   ├── components/                # React components
│   │   ├── FileManager/           # Core file manager component
│   │   ├── Toolbar/               # Action buttons
│   │   ├── FileList/              # Directory contents display
│   │   ├── Modals/                # Dialog components
│   │   └── ...
│   ├── services/                  # API services
│   ├── utils/                     # Utility functions
│   └── styles/                    # Global styles
│
├── assets/                        # Static assets
│   ├── css/                       # Compiled CSS
│   ├── js/                        # Compiled JS
│   └── images/                    # Icons and images
│
└── build/                         # Build output (gitignored)
```

### Backend Architecture

#### Main Plugin Class (`class-rz-file-manager.php`)

The main plugin class serves as the entry point for the plugin. It:

1. Registers hooks for activation, deactivation, and uninstallation
2. Initializes other classes (REST API, Admin, Assets)
3. Defines plugin constants and global functions

#### REST API Class (`class-rest-api.php`)

This class registers and implements the REST API endpoints that the React frontend will communicate with. Each endpoint:

1. Validates user permissions using WordPress capabilities
2. Sanitizes input parameters
3. Performs the requested file operation using the Filesystem class
4. Returns a properly formatted response

Endpoints will follow the pattern: `/wp-json/rz-file-manager/v1/[operation]`

#### Filesystem Class (`class-filesystem.php`)

This class handles all file system operations using the WordPress Filesystem API. It provides methods for:

1. Listing directory contents
2. Creating, reading, updating, and deleting files and folders
3. Uploading and downloading files
4. Moving, copying, and renaming files and folders
5. Getting file information (size, type, modified date)

#### Admin Class (`class-admin.php`)

This class sets up the admin page where the React app will be mounted. It:

1. Registers the admin menu item
2. Creates the container for the React app
3. Handles any admin-specific functionality

#### Assets Class (`class-assets.php`)

This class manages the loading of scripts and styles. It:

1. Enqueues the compiled React app
2. Localizes scripts with necessary data (REST API URLs, nonces)
3. Handles any other assets needed by the plugin

### Frontend Architecture

#### React App Structure

The React app follows a component-based architecture with the following key elements:

1. **App Component**: The root component that initializes the app and sets up routing (if used)
2. **Context Providers**: For managing global state such as:
   - Current directory path
   - Selected files
   - Loading states
   - Error messages
3. **Components**: Reusable UI elements organized by feature
4. **Services**: Modules for API communication
5. **Utilities**: Helper functions for common tasks

#### State Management

The app uses React Context API for state management, with a structure like:

```javascript
// FileManagerContext.js
const FileManagerContext = createContext();

const FileManagerProvider = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('/');
  const [files, setFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Methods for file operations
  const listFiles = async (path) => { /* ... */ };
  const uploadFiles = async (files) => { /* ... */ };
  // ... other methods
  
  const value = {
    currentPath, setCurrentPath,
    files, setFiles,
    selectedFiles, setSelectedFiles,
    loading, error,
    listFiles, uploadFiles, /* ... other methods */
  };
  
  return (
    <FileManagerContext.Provider value={value}>
      {children}
    </FileManagerContext.Provider>
  );
};
```

#### API Communication

API services are organized in a dedicated module that handles all communication with the WordPress REST API:

```javascript
// api.js
const API = {
  listFiles: async (path) => {
    const response = await fetch(`${rzFileManager.restUrl}list?path=${encodeURIComponent(path)}`, {
      headers: {
        'X-WP-Nonce': rzFileManager.nonce
      }
    });
    if (!response.ok) throw new Error('Failed to list files');
    return response.json();
  },
  // ... other API methods
};
```

## Security Considerations

### Backend Security

1. **User Capabilities**: All REST API endpoints check for appropriate user capabilities
2. **Input Sanitization**: All user input is sanitized to prevent injection attacks
3. **Path Traversal Prevention**: File paths are validated to prevent directory traversal
4. **Nonce Verification**: REST API requests include nonce verification
5. **File Type Restrictions**: Upload endpoints validate file types against an allowlist

### Frontend Security

1. **XSS Prevention**: React's built-in protections against XSS
2. **Secure API Calls**: All API calls include the WordPress nonce
3. **User Feedback**: Clear error messages without exposing sensitive information

## Performance Optimization

### Backend Optimization

1. **Efficient Filesystem Operations**: Minimize filesystem operations
2. **Pagination**: Support for paginated directory listings for large directories
3. **Caching**: Optional caching of directory listings

### Frontend Optimization

1. **Code Splitting**: Load components only when needed
2. **Virtualized Lists**: For efficiently rendering large directories
3. **Optimized Bundle Size**: Minimize JavaScript bundle size
4. **Lazy Loading**: For non-critical components

## Extension Points

The plugin is designed to be extensible through:

1. **WordPress Filters**: For modifying plugin behavior
2. **WordPress Actions**: For adding custom functionality at specific points
3. **Component Props**: For customizing React components

## Development Workflow

1. **Setup**: Clone repository and run `npm install`
2. **Development**: Run `npm start` for development mode with hot reloading
3. **Building**: Run `npm run build` to create production-ready assets
4. **Testing**: Run `npm test` for JavaScript tests

## Deployment

The plugin can be deployed like any standard WordPress plugin:

1. Zip the entire plugin directory
2. Upload through the WordPress admin interface
3. Activate the plugin

## Browser Compatibility

The plugin supports all modern browsers:

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## WordPress Compatibility

- WordPress 5.8+
- PHP 7.4+

---

This documentation provides a high-level overview of the technical architecture and design decisions for the RZ File Manager plugin. It serves as a guide for developers who want to understand, modify, or extend the plugin.
