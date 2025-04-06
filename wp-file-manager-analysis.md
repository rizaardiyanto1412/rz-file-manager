# WP File Manager Plugin Analysis

This document outlines the basic working mechanism of the WP File Manager plugin (version 8.0.1).

## Overview

WP File Manager provides a user interface within the WordPress admin area to manage files and folders on the server, similar to FTP or cPanel's file manager. It allows users to perform operations like viewing, editing, uploading, downloading, deleting, copying, pasting, and archiving files.

## Core Technology

The plugin heavily relies on the **elFinder** open-source file manager library ([https://github.com/Studio-42/elFinder](https://github.com/Studio-42/elFinder)).

*   **Frontend UI:** The file manager interface (the file tree, icons, toolbars, menus, dialogs) is provided by the elFinder JavaScript library (`lib/js/`).
*   **Backend Logic:** File system operations (listing directories, reading/writing files, etc.) are handled by the elFinder PHP library (`lib/php/`).
*   **Editor:** File editing likely uses the CodeMirror library (`lib/codemirror/`), often bundled with elFinder.

## Workflow

1.  **Initialization:**
    *   The main plugin file, `file_folder_manager.php`, is loaded by WordPress.
    *   It defines constants and instantiates the main class `mk_file_folder_manager`.
    *   The constructor (`__construct`) registers various WordPress action and filter hooks.

2.  **Admin Menu:**
    *   The `admin_menu` hook (via `ffm_menu_page`) adds the "WP File Manager" menu item to the WordPress admin sidebar.

3.  **Loading the File Manager:**
    *   When a user navigates to the "WP File Manager" admin page, WordPress triggers the functions associated with that page.
    *   The `admin_enqueue_scripts` hook (via `ffm_admin_script`) loads the necessary CSS (`lib/css/`, `css/`) and JavaScript (`lib/js/`, `js/`) files required by elFinder and the plugin itself.
    *   A plugin JavaScript file initializes the elFinder UI widget on the page. This initialization includes setting the URL for the backend connector.

4.  **AJAX Communication (elFinder Frontend <-> Backend):**
    *   User actions in the elFinder UI (e.g., clicking a folder, selecting "Upload") trigger JavaScript events.
    *   The elFinder JavaScript sends AJAX requests to the WordPress AJAX handler (`wp-admin/admin-ajax.php`). These requests include:
        *   An `action` parameter set to `mk_file_folder_manager`.
        *   Parameters specific to the elFinder command (e.g., `cmd=open`, `target=hash_of_directory`).
        *   A WordPress nonce (`_wpnonce`) for security.

5.  **WordPress AJAX Handling:**
    *   WordPress receives the AJAX request. Based on the `action=mk_file_folder_manager`, it calls the PHP function hooked to `wp_ajax_mk_file_folder_manager`, which is the `mk_file_folder_manager_action_callback` method within the `mk_file_folder_manager` class.

6.  **elFinder PHP Connector:**
    *   The `mk_file_folder_manager_action_callback` function:
        *   Verifies the WordPress nonce.
        *   Includes the elFinder PHP library (`require 'lib/php/autoload.php';`).
        *   Retrieves plugin settings (root path, allowed actions, etc.) from WordPress options (`get_option('wp_file_manager_settings')`).
        *   Configures the elFinder PHP options (`$opts`), defining the root directory, URL, access controls, upload rules, trash location, etc., based on plugin settings and WordPress environment (`ABSPATH`, `site_url()`).
        *   Instantiates the `elFinderConnector` with the configured `elFinder` object (`new elFinderConnector(new elFinder($opts))`).
        *   Calls the connector's `run()` method.

7.  **File System Operations:**
    *   The `elFinderConnector::run()` method processes the command sent from the frontend.
    *   It uses the configured elFinder driver (`LocalFileSystem`) to interact with the server's file system using standard PHP functions (potentially wrapped by WordPress filesystem functions).

8.  **Response:**
    *   The elFinder PHP library generates a JSON-formatted response containing the result of the operation (e.g., directory listing, success/error status).
    *   This JSON response is sent back through the WordPress AJAX handler to the elFinder JavaScript running in the user's browser.

9.  **UI Update:**
    *   The elFinder JavaScript receives the JSON response and updates the UI accordingly (e.g., displaying the contents of a folder, showing an upload progress bar, reporting an error).

## Other Notable Points

*   **REST API:** The plugin also registers some custom REST API endpoints (hooked via `rest_api_init`) for specific functions like downloading backups (`fm_download_backup`). This is an alternative communication channel to `admin-ajax.php`.
*   **Database:** An activation hook (`register_activation_hook`) calls `mk_file_folder_manager_create_tables` to likely create custom database tables (perhaps for storing backup information or logs, based on the presence of `wpdb` calls related to `wpfm_backup` in the code).
*   **Settings:** Plugin settings are stored in the WordPress options table (`wp_options`) under the key `wp_file_manager_settings`.
*   **Security:** Uses WordPress nonces to protect AJAX actions against CSRF attacks. Access controls within elFinder are configured based on plugin settings, potentially limiting operations for different user roles (though role-based control seems more prominent in the Pro version according to `readme.txt`).

## File Structure Summary

*   `file_folder_manager.php`: Main plugin file (bootstrap, hooks, main class).
*   `lib/`: Contains the core elFinder library (PHP, JS, CSS, assets) and potentially other libraries like CodeMirror.
    *   `lib/php/`: elFinder backend connector and drivers.
    *   `lib/js/`: elFinder frontend JavaScript.
    *   `lib/css/`: elFinder frontend CSS.
    *   `lib/wpfilemanager.php`: Likely a wrapper or helper for integrating elFinder with WordPress within the callback.
*   `js/`: Plugin-specific JavaScript (likely for initializing elFinder and maybe custom UI elements).
*   `css/`: Plugin-specific CSS.
*   `classes/`: Plugin-specific PHP classes (e.g., `files-restore.php`).
*   `inc/`: Include files (PHP templates or helper functions).
*   `languages/`: Translation files.
*   `readme.txt`: Plugin description, features, changelog.
