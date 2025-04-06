<?php
/**
 * REST API class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API class.
 *
 * This class handles the REST API endpoints for the file manager.
 */
class RZ_File_Manager_REST_API {

    /**
     * Filesystem instance.
     *
     * @var RZ_File_Manager_Filesystem
     */
    private $filesystem;

    /**
     * API namespace.
     *
     * @var string
     */
    private $namespace = 'rz-file-manager/v1';

    /**
     * Constructor.
     */
    public function __construct() {
        // Determine root path (Mirroring logic from RZ_File_Manager_Assets::get_root_path for consistency)
        // WARNING: Using ABSPATH can be risky. Better to use options.
        $root_path = ABSPATH;

        // Initialize filesystem with the determined root path
        $this->filesystem = new RZ_File_Manager_Filesystem($root_path);
        
        // Register REST API routes
        add_action('rest_api_init', array($this, 'register_routes'));
    }

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
                'callback'            => array($this, 'create_folder'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'name' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Register route for uploading files
        register_rest_route(
            $this->namespace,
            '/upload',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'upload_file'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
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
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Register route for copying files and directories
        register_rest_route(
            $this->namespace,
            '/copy',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'copy_item'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'source' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'destination' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Register route for moving files and directories
        register_rest_route(
            $this->namespace,
            '/move',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'move_item'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'source' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'destination' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Register route for getting file content
        register_rest_route(
            $this->namespace,
            '/get-content',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_file_content'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Register route for saving file content
        register_rest_route(
            $this->namespace,
            '/save-content',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'save_file_content'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                    'content' => array(
                        'required'          => true,
                    ),
                ),
            )
        );

        // Register route for downloading files
        register_rest_route(
            $this->namespace,
            '/download',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'download_file'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Route for getting file content -- REMOVED DUPLICATE
        /*
        register_rest_route(
            $this->namespace,
            '/get-content',
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array($this, 'get_content'), // Different callback
                'permission_callback' => array($this, 'can_manage_files'), // Different permission callback
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'validate_callback' => function($param) {
                            return is_string($param) && !empty($param);
                        },
                        'sanitize_callback' => 'sanitize_text_field',
                        'description'       => __('Path to the file.', 'rz-file-manager'),
                    ),
                ),
            )
        );
        */

        // Route for saving file content -- REMOVED DUPLICATE
        /*
        register_rest_route(
            $this->namespace,
            '/save-content',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'save_content'), // Different callback
                'permission_callback' => array($this, 'can_manage_files'), // Different permission callback
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'validate_callback' => function($param) {
                            return is_string($param) && !empty($param);
                        },
                        'sanitize_callback' => 'sanitize_text_field',
                        'description'       => __('Path to the file.', 'rz-file-manager'),
                    ),
                    'content' => array(
                        'required'          => true,
                        'validate_callback' => function($param) {
                            return is_string($param);
                        },
                        'description'       => __('The file content to save.', 'rz-file-manager'),
                    ),
                ),
            )
        );
        */
    }

    /**
     * Check if user has permission to use the file manager.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return bool True if user has permission, false otherwise.
     */
    public function check_permissions($request) {
        // Check if user can manage options
        return current_user_can('manage_options');
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
    public function create_folder($request) {
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
                'message' => __('Folder created successfully.', 'rz-file-manager'),
            ),
            201
        );
    }

    /**
     * Upload a file.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function upload_file($request) {
        // Get path parameter
        $path = $request->get_param('path');
        
        // Check if files were uploaded
        if (empty($_FILES['file'])) {
            return new WP_Error(
                'no_file',
                __('No file was uploaded.', 'rz-file-manager'),
                array('status' => 400)
            );
        }
        
        // Upload file
        $result = $this->filesystem->upload_file($path, $_FILES['file']);
        
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
                'message' => __('File uploaded successfully.', 'rz-file-manager'),
            ),
            201
        );
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
                'message' => __('Item deleted successfully.', 'rz-file-manager'),
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
                'message' => __('Item renamed successfully.', 'rz-file-manager'),
            ),
            200
        );
    }

    /**
     * Copy a file or directory.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function copy_item($request) {
        // Get parameters
        $source = $request->get_param('source');
        $destination = $request->get_param('destination');
        
        // Copy item
        $result = $this->filesystem->copy($source, $destination);
        
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
                'message' => __('Item copied successfully.', 'rz-file-manager'),
            ),
            200
        );
    }

    /**
     * Move a file or directory.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function move_item($request) {
        // Get parameters
        $source = $request->get_param('source');
        $destination = $request->get_param('destination');
        
        // Move item
        $result = $this->filesystem->move($source, $destination);
        
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
                'message' => __('Item moved successfully.', 'rz-file-manager'),
            ),
            200
        );
    }

    /**
     * Get file content.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function get_file_content($request) {
        // Get path parameter
        $path = $request->get_param('path');
        
        // Get file content
        $content = $this->filesystem->get_file_content($path);
        
        // Check for errors
        if (is_wp_error($content)) {
            return new WP_Error(
                $content->get_error_code(),
                $content->get_error_message(),
                array('status' => 400)
            );
        }
        
        // Return success response
        return new WP_REST_Response(
            array(
                'success' => true,
                'content' => $content,
            ),
            200
        );
    }

    /**
     * Save file content.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function save_file_content($request) {
        // Get parameters
        $path = $request->get_param('path');
        $content = $request->get_param('content');
        
        // Save file content
        $result = $this->filesystem->save_file_content($path, $content);
        
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
                'message' => __('File saved successfully.', 'rz-file-manager'),
            ),
            200
        );
    }

    /**
     * Download a file.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function download_file($request) {
        // Get path parameter
        $path = $request->get_param('path');
        
        // Validate path
        $absolute_path = $this->filesystem->validate_path($path);
        if (!$absolute_path) {
            return new WP_Error(
                'invalid_path',
                __('Invalid path specified.', 'rz-file-manager'),
                array('status' => 400)
            );
        }
        
        // Check if file exists
        if (!file_exists($absolute_path) || is_dir($absolute_path)) {
            return new WP_Error(
                'not_found',
                __('File not found.', 'rz-file-manager'),
                array('status' => 404)
            );
        }
        
        // Get file info
        $filename = basename($absolute_path);
        $filesize = filesize($absolute_path);
        $filetype = wp_check_filetype($filename);
        
        // Set headers for download
        header('Content-Description: File Transfer');
        header('Content-Type: ' . $filetype['type']);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . $filesize);
        
        // Clear output buffer
        ob_clean();
        flush();
        
        // Read file and output it
        readfile($absolute_path);
        exit;
    }

    /**
     * Get file content.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function get_content(WP_REST_Request $request) {
        $path = $request->get_param('path');

        $content = $this->filesystem->get_file_content($path);

        if (false === $content) {
            return new WP_Error('cant_read_file', __('Could not read file content.', 'rz-file-manager'), array('status' => 500));
        }
        
        // Consider adding checks for allowed file types here
        if (!$this->is_editable_file($path)) {
             return new WP_Error('file_not_editable', __('This file type cannot be edited.', 'rz-file-manager'), array('status' => 403));
        }

        return new WP_REST_Response(array('success' => true, 'content' => $content), 200);
    }

    /**
     * Save file content.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error object on failure.
     */
    public function save_content(WP_REST_Request $request) {
        $path    = $request->get_param('path');
        $content = $request->get_param('content');

        // Basic security: Ensure the user has the necessary capability (already done by permission_callback, but good practice).
        if (!current_user_can('manage_options')) { // Or a more specific capability
            return new WP_Error('rest_forbidden', esc_html__('Sorry, you are not allowed to do that.'), array('status' => is_user_logged_in() ? 403 : 401));
        }
        
         // Consider adding checks for allowed file types here
        if (!$this->is_editable_file($path)) {
             return new WP_Error('file_not_editable', __('This file type cannot be edited.', 'rz-file-manager'), array('status' => 403));
        }

        $result = $this->filesystem->save_file_content($path, $content);

        if (!$result) {
            return new WP_Error('cant_save_file', __('Could not save file content.', 'rz-file-manager'), array('status' => 500));
        }

        return new WP_REST_Response(array('success' => true, 'message' => __('File saved successfully.', 'rz-file-manager')), 200);
    }

    /**
     * Check if a file is editable based on its extension.
     *
     * @param string $path Path to the file.
     * @return bool True if editable, false otherwise.
     */
    private function is_editable_file($path) {
        $editable_extensions = array('txt', 'css', 'js', 'php', 'html', 'htm', 'json', 'xml', 'md', 'log', 'sql'); // Add more as needed
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return in_array($extension, $editable_extensions, true);
    }

    /**
     * Check if the user has permission to manage files.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return bool True if user has permission, false otherwise.
     */
    public function can_manage_files($request) {
        // Check if user can manage options
        return current_user_can('manage_options');
    }
}
