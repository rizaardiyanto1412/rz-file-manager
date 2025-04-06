# Building a WordPress File Manager Plugin with React

This document outlines the steps and approach for creating a WordPress plugin similar to WP File Manager, but using React for the frontend user interface.

## Core Concept

The approach involves using WordPress/PHP for the backend logic (file system operations, security, WordPress integration) exposed via the WordPress REST API, and a React application for the frontend user interface (rendering the file browser, handling user interactions).

## 1. Backend (WordPress Plugin - PHP)

The backend handles the actual file operations and communicates with the React frontend via the WordPress REST API.

### 1.1. Plugin Setup

*   Create a standard WordPress plugin structure (main plugin file, directories for PHP classes, assets, etc.).
*   The main plugin file registers hooks, including the REST API endpoints and the admin menu page.

### 1.2. Custom REST API Endpoints

*   Use `register_rest_route` within a function hooked to `rest_api_init` to define custom endpoints.
*   **Namespace:** Choose a unique namespace (e.g., `my-file-manager/v1`).
*   **Routes:** Define routes for each required file operation. Examples:
    *   `GET /list`: List files/folders in a given path.
        *   *Parameters:* `path` (string)
        *   *Returns:* JSON array of file/folder objects (name, type, size, modified date, etc.).
    *   `POST /upload`: Upload one or more files to a given path.
        *   *Parameters:* `path` (string), `files` (file data in request body - typically `multipart/form-data`).
        *   *Returns:* JSON success/error status for each file.
    *   `POST /create-folder`:
        *   *Parameters:* `path` (string), `name` (string)
        *   *Returns:* JSON success/error status.
    *   `POST /rename`:
        *   *Parameters:* `old_path` (string), `new_name` (string)
        *   *Returns:* JSON success/error status.
    *   `POST /move`:
        *   *Parameters:* `source_paths` (array of strings), `destination_path` (string)
        *   *Returns:* JSON success/error status.
    *   `POST /copy`:
        *   *Parameters:* `source_paths` (array of strings), `destination_path` (string)
        *   *Returns:* JSON success/error status.
    *   `DELETE /delete`:
        *   *Parameters:* `paths` (array of strings)
        *   *Returns:* JSON success/error status.
    *   `GET /download`:
        *   *Parameters:* `path` (string)
        *   *Returns:* File stream (requires setting correct headers like `Content-Disposition`).
    *   `GET /get-content`:
        *   *Parameters:* `path` (string)
        *   *Returns:* JSON object with file content `{ "content": "..." }`.
    *   `POST /save-content`:
        *   *Parameters:* `path` (string), `content` (string)
        *   *Returns:* JSON success/error status.
    *   *(Optional)* `POST /archive`: Create a zip archive.
    *   *(Optional)* `POST /extract`: Extract a zip archive.
*   **Callback Functions:** Each route needs a PHP callback function.
    *   **Permissions Check:** Use `current_user_can()` to ensure the user has the required capabilities (e.g., `manage_options` or a custom capability).
The REST API automatically handles nonces for logged-in users.
    *   **Input Sanitization:** Sanitize all input parameters (`sanitize_text_field`, `sanitize_file_name`, etc.) to prevent security vulnerabilities like directory traversal.
    *   **File Operations:** Use the WordPress Filesystem API (`WP_Filesystem()`). Request credentials if needed. This provides a safer and more compatible way to interact with the filesystem than raw PHP functions.
        *   `$wp_filesystem->dirlist( $path )`
        *   `$wp_filesystem->put_contents( $path, $content )`
        *   `$wp_filesystem->get_contents( $path )`
        *   `$wp_filesystem->mkdir( $path )`
        *   `$wp_filesystem->move( $source, $destination )`
        *   `$wp_filesystem->copy( $source, $destination )`
        *   `$wp_filesystem->delete( $path, true )` // Recursive delete
    *   **Response:** Return data using `WP_REST_Response` for proper JSON formatting and status codes.

### 1.3. Admin Page Setup

*   Use `add_menu_page` (hooked to `admin_menu`) to create the admin page where the React app will live.
*   The callback function for this menu page should:
    *   Output a simple container div: `<div id="my-react-fm-root"></div>`.
    *   Enqueue the compiled React JS and CSS bundles using `wp_enqueue_script` and `wp_enqueue_style` (hooked to `admin_enqueue_scripts`). Make sure the script handle matches the one used in your build process.
    *   Pass necessary data from PHP to JavaScript (like the REST API base URL and nonce) using `wp_localize_script`. Example:
        ```php
        wp_enqueue_script( 'my-fm-react-app', plugin_dir_url( __FILE__ ) . 'assets/js/main.js', array('wp-element'), '1.0', true );
        wp_localize_script( 'my-fm-react-app', 'myFmData', array(
            'rest_url' => esc_url_raw( rest_url( 'my-file-manager/v1/' ) ),
            'nonce'    => wp_create_nonce( 'wp_rest' )
        ) );
        ```

## 2. Frontend (React Application)

This is the user interface built with React.

### 2.1. Development Setup

*   **Environment:** Node.js, npm/yarn.
*   **Build Tool:**
    *   **`@wordpress/scripts`:** Recommended for WordPress integration. It's built by the WordPress team, understands WordPress conventions (like `wp-element` for React), and simplifies configuration.
    *   **Vite / Create React App:** Also possible, but requires more manual configuration to integrate with WordPress (output paths, handling `wp-element` if needed, potentially different build commands).
*   **Project Structure:** Organize your React code within a dedicated folder (e.g., `src/` or `react-src/`) inside your plugin directory.

### 2.2. React App Structure

*   **Root Component:** An `App` component rendered into the `#my-react-fm-root` div.
*   **Components:** Break down the UI into reusable components:
    *   `FileManager` (Main container)
    *   `Toolbar` (Buttons for actions: Upload, New Folder, etc.)
    *   `Breadcrumbs` (Show current path)
    *   `FileList` (Displays files/folders - could be a table or grid)
    *   `FileItem` (Represents a single file/folder in the list)
    *   `UploadModal` / `UploadArea`
    *   `CreateFolderModal`
    *   `RenameModal`
    *   `ContextMenu` (Right-click menu on files/folders)
    *   *(Optional)* `CodeEditor` (Integrate a library like Monaco Editor or CodeMirror via React wrappers)
*   **State Management:**
    *   `useState`/`useReducer`: For local component state.
    *   Context API / Zustand / Redux Toolkit / Jotai: For global state like current path, file list, selected files, loading indicators, error messages.
*   **Routing (Optional):** If you want browser history integration (back/forward buttons change directory), consider a simple client-side routing solution (like using URL hash `#` or query parameters `?path=`) managed within React.

### 2.3. API Communication

*   Use `fetch` API or libraries like `axios`.
*   Access the REST URL and nonce passed via `wp_localize_script` (e.g., `myFmData.rest_url`, `myFmData.nonce`).
*   Send the nonce in requests using the `X-WP-Nonce` header:
    ```javascript
    fetch(`${myFmData.rest_url}list?path=${currentPath}`, {
      headers: {
        'X-WP-Nonce': myFmData.nonce
      }
    })
    .then(response => response.json())
    .then(data => {
      // Update state with file list
    });
    ```
*   Handle loading states and display user feedback (spinners, messages).
*   Handle errors gracefully (display error messages from the API).

### 2.4. Build Process

*   Configure your build tool (`@wordpress/scripts`, Vite, Webpack) to:
    *   Compile your React/JSX code and CSS.
    *   Output the final JS and CSS bundles to a specific location in your plugin (e.g., `assets/js/main.js`, `assets/css/main.css`).
    *   Ensure the entry point and output filenames match what you enqueue in PHP.
    *   If using `@wordpress/scripts`, the commands are typically `npm start` (for development) and `npm run build` (for production).

## 3. Key Considerations

*   **Security:** Paramount. Always validate user permissions and sanitize *all* input on the PHP/backend side. Never trust data coming from the client.
*   **Error Handling:** Provide clear feedback to the user for both client-side and server-side errors.
*   **Performance:** Optimize API calls. For large directories, consider pagination or virtual scrolling in the React frontend. Optimize the React app's rendering performance.
*   **User Experience (UX):** Design intuitive interactions (drag-and-drop, clear visual states for selection/loading, keyboard shortcuts).
*   **Root Directory:** Decide carefully what the base directory for the file manager should be (e.g., WP uploads folder, WP content folder, or `ABSPATH`). Configure this securely in the backend.
*   **File Previews:** Implementing image/PDF/code previews requires additional logic both in the backend (endpoints to serve file content appropriately) and frontend (components to display them).
*   **Dependencies:** Keep frontend (npm) and backend (PHP/WordPress) dependencies updated.

This approach provides a robust separation between the backend logic managed by WordPress/PHP and a modern, interactive frontend built with React.
