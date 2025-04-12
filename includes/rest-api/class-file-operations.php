<?php
/**
 * File Operations REST API class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * File Operations REST API class.
 *
 * This class handles the REST API endpoints for file and directory operations.
 */
class RZ_File_Manager_REST_API_File_Operations extends RZ_File_Manager_REST_API_Base {

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_routes() {
        // Register route for listing files and directories
        register_rest_route(
            $this->namespace,
            '/list',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'list_items'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => false,
                        'default'           => '',
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Register route for creating directories
        register_rest_route(
            $this->namespace,
            '/create-folder',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'handle_create_folder_request'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'name' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_file_name',
                    ),
                ),
            )
        );

        // Register route for creating files
        register_rest_route(
            $this->namespace,
            '/create-file',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'handle_create_file_request'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'filename' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_file_name',
                    ),
                ),
            )
        );

        // Register route for deleting files and directories
        register_rest_route(
            $this->namespace,
            '/delete',
            array(
                'methods'             => WP_REST_Server::DELETABLE,
                'callback'            => array($this, 'delete_item'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Register route for renaming files and directories
        register_rest_route(
            $this->namespace,
            '/rename',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'rename_item'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'new_name' => array(
                        'required'          => true,
                    ),
                ),
            )
        );
    }

    /**
     * List files and directories.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function list_items($request) {
        // Get path parameter
        $path = $request->get_param('path');
        
        // List directory contents
        $items = $this->filesystem->list_directory($path);
        
        // Check for errors
        if (is_wp_error($items)) {
            return new WP_Error(
                $items->get_error_code(),
                $items->get_error_message(),
                array('status' => 400)
            );
        }
        
        // Return success response
        return new WP_REST_Response(
            array(
                'success' => true,
                'items'   => $items,
            ),
            200
        );
    }

    /**
     * Create a new folder.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function handle_create_folder_request($request) {
        // Get parameters
        $path = $request->get_param('path');
        $name = $request->get_param('name');
        
        // Create directory
        $result = $this->filesystem->create_directory($path, $name);
        
        // Check for errors
        if (is_wp_error($result)) {
            return new WP_Error(
                $result->get_error_code(),
                $result->get_error_message(),
                array('status' => 400)
            );
        }
        
        // Return success response
        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => esc_html__('Folder created successfully.', 'rz-file-manager'),
            ),
            201
        );
    }

    /**
     * Create a new file.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function handle_create_file_request($request) {
        $relative_path = $request->get_param('path');
        $filename      = $request->get_param('filename');

        // Get the base uploads directory
        $base_dir = $this->filesystem->get_root_path();
        if (is_wp_error($base_dir)) {
            return new WP_Error('base_dir_error', __('Could not determine base directory.', 'rz-file-manager'), array('status' => 500));
        }

        $full_dir_path = $this->filesystem->validate_path($relative_path); // Use validate_path from filesystem

        // Check if validate_path returned an error or if it's not a directory
        if (is_wp_error($full_dir_path) || !$this->filesystem->is_dir($full_dir_path)) {
            return $full_dir_path instanceof WP_Error ? $full_dir_path : new WP_Error('invalid_directory_path', __('Invalid or non-existent directory path specified.', 'rz-file-manager'), array('status' => 400));
        }

        // Basic validation for filename
        if (empty($filename)) {
            return new WP_Error(
                'empty_filename',
                __('Filename cannot be empty.', 'rz-file-manager'),
                array('status' => 400)
            );
        }

        // Check for invalid characters (basic check, might need refinement)
        if (preg_match('/[\/\\\\:*?\"<>|]/', $filename)) {
            return new WP_Error(
                'invalid_filename',
                __('Filename contains invalid characters.', 'rz-file-manager'),
                array('status' => 400)
            );
        }

        $full_file_path = $full_dir_path . DIRECTORY_SEPARATOR . $filename;

        // Check if file already exists
        if ($this->filesystem->exists($full_file_path)) {
            return new WP_Error(
                'file_exists',
                esc_html__('File already exists.', 'rz-file-manager'), // Use esc_html__ here too
                array('status' => 400)
            );
        }

        // Attempt to create an empty file using WP_Filesystem
        $result = $this->filesystem->put_contents($full_file_path, '');

        if ($result === true) {
            // Optionally set permissions using WP_Filesystem if needed: $this->filesystem->chmod($full_file_path, 0644);
            return new WP_REST_Response(
                array(
                    'success' => true,
                    'message' => esc_html__('File created successfully.', 'rz-file-manager'),
                ),
                201
            );
        } else {
            return new WP_Error(
                'create_file_error',
                esc_html__('Could not create file. Check permissions.', 'rz-file-manager'), // Use esc_html__
                array('status' => 500)
            );
        }
    }

    /**
     * Delete a file or directory.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function delete_item($request) {
        // Get path parameter
        $path = $request->get_param('path');
        
        // Delete item
        $result = $this->filesystem->delete($path);
        
        // Check for errors
        if (is_wp_error($result)) {
            return new WP_Error(
                $result->get_error_code(),
                $result->get_error_message(),
                array('status' => 400)
            );
        }
        
        // Return success response
        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => esc_html__('Item deleted successfully.', 'rz-file-manager'),
            ),
            200
        );
    }

    /**
     * Rename a file or directory.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function rename_item($request) {
        // Get parameters
        $path = $request->get_param('path');
        $new_name = $request->get_param('new_name');
        
        // Rename item
        $result = $this->filesystem->rename($path, $new_name);
        
        // Check for errors
        if (is_wp_error($result)) {
            return new WP_Error(
                $result->get_error_code(),
                $result->get_error_message(),
                array('status' => 400)
            );
        }
        
        // Return success response
        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => esc_html__('Item renamed successfully.', 'rz-file-manager'),
            ),
            200
        );
    }
}
