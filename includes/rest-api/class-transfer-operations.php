<?php
/**
 * Transfer Operations REST API class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Transfer Operations REST API class.
 *
 * This class handles the REST API endpoints for file upload and download operations.
 */
class RZ_File_Manager_REST_API_Transfer_Operations extends RZ_File_Manager_REST_API_Base {

    /**
     * Constructor.
     */
    public function __construct() {
        parent::__construct();
        
        // Register Admin AJAX actions for downloads
        add_action('wp_ajax_rz_fm_download_item', array($this, 'handle_download_item'));
        add_action('wp_ajax_rz_fm_download_zip', array($this, 'handle_download_zip'));
    }

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_routes() {
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
    }

    /**
     * Upload a file.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object or WP_Error.
     */
    public function handle_upload_file($request) {
        // Security Note: Nonce verification is typically handled by the 'permission_callback' 
        // in register_rest_route for REST API endpoints, not checked here directly.
        // phpcs:ignore WordPress.Security.NonceVerification.Missing
        $current_path = $request->get_param('current_path'); // Assuming path is validated/sanitized by filesystem methods

        // Basic validation
        // phpcs:ignore WordPress.Security.NonceVerification.Missing
        if (!isset($_FILES['file'])) {
            return new WP_REST_Response(['success' => false, 'message' => esc_html__('No file data received.', 'rz-file-manager')], 400);
        }

        // Check for upload errors (ensure index exists first)
        // phpcs:ignore WordPress.Security.NonceVerification.Missing
        if (!isset($_FILES['file']['error'])){
             return new WP_REST_Response(['success' => false, 'message' => esc_html__('Invalid file upload data.', 'rz-file-manager')], 400);
        }
        
        $upload_error = (int) $_FILES['file']['error']; // Sanitize as integer

        // phpcs:ignore WordPress.Security.NonceVerification.Missing
        if ($upload_error !== UPLOAD_ERR_OK) {
            return new WP_REST_Response(['success' => false, 'message' => $this->get_upload_error_message($upload_error)], 400);
        }

        // The $this->filesystem->upload_file method is responsible for securely handling 
        // and sanitizing the contents of the $_FILES['file'] array (e.g., using wp_handle_upload).
        // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce handled by REST permission_callback
        $file = $_FILES['file'];

        try {
            // Assume $this->filesystem is an instance of your Filesystem class
            // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitization handled within upload_file method
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce handled by REST permission_callback
            $result = $this->filesystem->upload_file($current_path, $file);

            // Check if the filesystem operation returned exactly true
            // phpcs:ignore WordPress.Security.NonceVerification.Missing -- Nonce handled by REST permission_callback
            if ($result === true) {
                // Filesystem class returned true, assume success, provide generic message
                return new WP_REST_Response(['success' => true, 'message' => esc_html__('File uploaded successfully.', 'rz-file-manager')], 200);
            } else {
                // Handle WP_Error specifically
                if (is_wp_error($result)) {
                    $message = $result->get_error_message();
                } else {
                    // Handle other failures (e.g., if filesystem returned false)
                    $message = is_array($result) && isset($result['message']) ? $result['message'] : 'Failed to upload file (filesystem operation failed).';
                }
                return new WP_REST_Response(['success' => false, 'message' => esc_html($message)], 500);
            }
        } catch (Exception $e) {
            return new WP_REST_Response(['success' => false, 'message' => 'Server error during upload: ' . esc_html($e->getMessage())], 500);
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
        // Note: Using readfile for performance in downloads. Ensure $absolute_path is validated before calling this function.
        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
        readfile($absolute_path);
        exit;
    }

    /**
     * Handle AJAX request to download a single file.
     */
    public function handle_download_item() {
        // Verify nonce
        check_ajax_referer('rz_fm_nonce', '_wpnonce');

        // Check user capabilities (e.g., can they manage files?)
        if (!current_user_can('upload_files')) {
            wp_die(esc_html__('You do not have permission to download files.', 'rz-file-manager'), 403);
        }

        // Sanitize input path
        $path = isset($_REQUEST['path']) ? sanitize_text_field(wp_unslash($_REQUEST['path'])) : '';

        if (empty($path)) {
            wp_die(esc_html__('Invalid file path.', 'rz-file-manager'), 400);
        }

        // Call the filesystem method (to be created)
        $result = $this->filesystem->download_file($path);

        // If the filesystem method returned an error (WP_Error), handle it
        if (is_wp_error($result)) {
            wp_die(esc_html($result->get_error_message()), (int) ($result->get_error_code() ?: 400));
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
            wp_die(esc_html__('You do not have permission to download folders.', 'rz-file-manager'), 403);
        }

        // Sanitize input path
        $path = isset($_REQUEST['path']) ? sanitize_text_field(wp_unslash($_REQUEST['path'])) : '';

        if (empty($path)) {
            wp_die(esc_html__('Invalid directory path.', 'rz-file-manager'), 400);
        }

        // Call the filesystem method (to be created)
        $result = $this->filesystem->download_directory_as_zip($path);

        // If the filesystem method returned an error (WP_Error), handle it
        if (is_wp_error($result)) {
            wp_die(esc_html($result->get_error_message()), (int) ($result->get_error_code() ?: 400));
        }

        // On success, download_directory_as_zip() handles the exit, so no code should run here.
    }
}
