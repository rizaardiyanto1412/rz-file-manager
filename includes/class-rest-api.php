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

        // Register Admin AJAX actions
        add_action('wp_ajax_rz_fm_download_item', array($this, 'handle_download_item'));
        add_action('wp_ajax_rz_fm_download_zip', array($this, 'handle_download_zip'));
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

        // Register route for uploading files
        register_rest_route(
            $this->namespace,
            '/upload',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'handle_upload_file'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'current_path' => array(
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

        // Register route for zipping files and directories
        register_rest_route(
            $this->namespace,
            '/zip',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'handle_zip_request'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );

        // Register route for unzipping files
        register_rest_route(
            $this->namespace,
            '/unzip',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'handle_unzip_request'),
                'permission_callback' => array($this, 'check_permissions'),
                'args'                => array(
                    'path' => array(
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ),
                ),
            )
        );
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
                'message' => __('Folder created successfully.', 'rz-file-manager'),
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
            error_log('[PHP REST API] handle_create_file_request: Error getting base directory: ' . $base_dir->get_error_message());
            return new WP_Error('base_dir_error', __('Could not determine base directory.', 'rz-file-manager'), array('status' => 500));
        }

        $full_dir_path = $this->filesystem->validate_path($relative_path); // Use validate_path from filesystem

        // Check if validate_path returned an error or if it's not a directory
        if (is_wp_error($full_dir_path) || !$this->filesystem->is_dir($full_dir_path)) {
            error_log('[PHP REST API] handle_create_file_request: Invalid directory path resolved: ' . (is_wp_error($full_dir_path) ? $full_dir_path->get_error_message() : $full_dir_path));
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
        if (file_exists($full_file_path)) {
            return new WP_Error(
                'file_exists',
                __('File already exists.', 'rz-file-manager'),
                array('status' => 400)
            );
        }

        // Attempt to create an empty file
        $file_handle = @fopen($full_file_path, 'w');
        if ($file_handle !== false) {
            fclose($file_handle);
            // Optionally set permissions, e.g., chmod($full_file_path, 0644);
            return new WP_REST_Response(
                array(
                    'success' => true,
                    'message' => __('File created successfully.', 'rz-file-manager'),
                ),
                201
            );
        } else {
            // Could also use file_put_contents($full_file_path, '') === false as a check
            return new WP_Error(
                'create_file_error',
                __('Could not create file. Check permissions.', 'rz-file-manager'),
                array('status' => 500)
            );
        }
    }

    /**
     * Upload a file.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function handle_upload_file($request) {
        $current_path = $request->get_param('current_path');
        error_log('[PHP REST API] handle_upload_file: Received request.');
        error_log('[PHP REST API] handle_upload_file: current_path = ' . print_r($current_path, true));
        error_log('[PHP REST API] handle_upload_file: $_FILES = ' . print_r($_FILES, true));

        // Basic validation
        if (!isset($_FILES['file'])) {
            error_log('[PHP REST API] handle_upload_file: Error - $_FILES["file"] not set.');
            return new WP_REST_Response(['success' => false, 'message' => 'No file data received.'], 400);
        }

        // Check for upload errors
        if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            error_log('[PHP REST API] handle_upload_file: Error - Upload error code: ' . $_FILES['file']['error']);
            return new WP_REST_Response(['success' => false, 'message' => $this->get_upload_error_message($_FILES['file']['error'])], 400);
        }

        $file = $_FILES['file'];

        try {
            // Assume $this->filesystem is an instance of your Filesystem class
            error_log('[PHP REST API] handle_upload_file: Calling filesystem->upload_file...');
            $result = $this->filesystem->upload_file($current_path, $file);
            error_log('[PHP REST API] handle_upload_file: Filesystem result: ' . print_r($result, true));

            // Check if the filesystem operation returned exactly true
            if ($result === true) {
                // Filesystem class returned true, assume success, provide generic message
                return new WP_REST_Response(['success' => true, 'message' => 'File uploaded successfully.'], 200);
            } else {
                // Handle WP_Error specifically
                if (is_wp_error($result)) {
                    $message = $result->get_error_message();
                    error_log('[PHP REST API] handle_upload_file: Upload failed (WP_Error). Message: ' . $message);
                } else {
                    // Handle other failures (e.g., if filesystem returned false)
                    $message = is_array($result) && isset($result['message']) ? $result['message'] : 'Failed to upload file (filesystem operation failed).';
                    error_log('[PHP REST API] handle_upload_file: Upload failed (Non-WP_Error). Filesystem result: ' . print_r($result, true));
                }
                return new WP_REST_Response(['success' => false, 'message' => $message], 500);
            }
        } catch (Exception $e) {
            error_log('[PHP REST API] handle_upload_file: Exception caught: ' . $e->getMessage());
            return new WP_REST_Response(['success' => false, 'message' => 'Server error during upload: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Helper function to translate upload error codes
     *
     * @param int $error_code The PHP upload error code.
     * @return string The error message.
     */
    private function get_upload_error_message($error_code) {
        switch ($error_code) {
            case UPLOAD_ERR_INI_SIZE:
                return 'The uploaded file exceeds the upload_max_filesize directive in php.ini.';
            case UPLOAD_ERR_FORM_SIZE:
                return 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.';
            case UPLOAD_ERR_PARTIAL:
                return 'The uploaded file was only partially uploaded.';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded.';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing a temporary folder.';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk.';
            case UPLOAD_ERR_EXTENSION:
                return 'A PHP extension stopped the file upload.';
            default:
                return 'Unknown upload error.';
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

    /**
     * Register hooks.
     */
    public function register_hooks() {
        add_action('rest_api_init', array($this, 'register_routes'));

        // AJAX actions for downloads (using admin-ajax.php)
        add_action('wp_ajax_rz_fm_download_item', array($this, 'handle_download_item'));
        add_action('wp_ajax_rz_fm_download_zip', array($this, 'handle_download_zip'));
    }

    /**
     * Handle AJAX request to download a single file.
     */
    public function handle_download_item() {
        // Verify nonce
        check_ajax_referer('rz_fm_nonce', '_wpnonce');

        // Check user capabilities (e.g., can they manage files?)
        if (!current_user_can('upload_files')) {
            wp_die(__('You do not have permission to download files.', 'rz-file-manager'), 403);
        }

        $path = isset($_REQUEST['path']) ? wp_unslash($_REQUEST['path']) : '';

        if (empty($path)) {
            wp_die(__('Invalid file path.', 'rz-file-manager'), 400);
        }

        // Call the filesystem method (to be created)
        $result = $this->filesystem->download_file($path);

        // If the filesystem method returned an error (WP_Error), handle it
        if (is_wp_error($result)) {
            wp_die($result->get_error_message(), $result->get_error_code() ?: 400);
        }

        // On success, download_file() handles the exit, so no code should run here.
    }

    /**
     * Handle AJAX request to download a directory as a zip file.
     */
    public function handle_download_zip() {
        // Verify nonce
        check_ajax_referer('rz_fm_nonce', '_wpnonce');

        // Check user capabilities
        if (!current_user_can('upload_files')) {
            wp_die(__('You do not have permission to download folders.', 'rz-file-manager'), 403);
        }

        $path = isset($_REQUEST['path']) ? wp_unslash($_REQUEST['path']) : '';

        if (empty($path)) {
            wp_die(__('Invalid directory path.', 'rz-file-manager'), 400);
        }

        // Call the filesystem method (to be created)
        $result = $this->filesystem->download_directory_as_zip($path);

        // If the filesystem method returned an error (WP_Error), handle it
        if (is_wp_error($result)) {
            wp_die($result->get_error_message(), $result->get_error_code() ?: 400);
        }

        // On success, download_directory_as_zip() handles the exit, so no code should run here.
    }

    /**
     * Handles zip request.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error on failure.
     */
    public function handle_zip_request(WP_REST_Request $request) {
        $path = $request->get_param('path');

        // Use the filesystem method to create the zip
        $result = $this->filesystem->create_zip($path);

        if (is_wp_error($result)) {
            // Determine appropriate status code based on error
            $status_code = 500;
            if ($result->get_error_code() === 'invalid_source_path' || $result->get_error_code() === 'source_not_found') {
                $status_code = 404;
            } elseif ($result->get_error_code() === 'zip_not_supported') {
                $status_code = 501; // Not Implemented
            }
             // Add more specific error code handling if needed
             
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => $status_code));
        }

        return new WP_REST_Response(array('success' => true, 'message' => __('Item zipped successfully.', 'rz-file-manager')), 201); // 201 Created (as a zip file was created)
    }

    /**
     * Handles unzip request.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error on failure.
     */
    public function handle_unzip_request(WP_REST_Request $request) {
        $path = $request->get_param('path');
        
        // Use the filesystem method to extract the zip
        $result = $this->filesystem->extract_zip($path);

        if (is_wp_error($result)) {
            // Determine appropriate status code based on error
            $status_code = 500;
            if ($result->get_error_code() === 'invalid_zip_path' || $result->get_error_code() === 'zip_not_found' || $result->get_error_code() === 'not_a_zip_file') {
                $status_code = 400; // Bad Request (invalid input)
            } elseif ($result->get_error_code() === 'unzip_destination_exists') {
                $status_code = 409; // Conflict
            } elseif ($result->get_error_code() === 'zip_not_supported') {
                 $status_code = 501; // Not Implemented
            }
             // Add more specific error code handling if needed
             
            return new WP_Error($result->get_error_code(), $result->get_error_message(), array('status' => $status_code));
        }

        return new WP_REST_Response(array('success' => true, 'message' => __('Archive extracted successfully.', 'rz-file-manager')), 200); // 200 OK
    }
}
