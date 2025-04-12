<?php
/**
 * Archive Operations REST API class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Archive Operations REST API class.
 *
 * This class handles the REST API endpoints for zip and unzip operations.
 */
class RZ_File_Manager_REST_API_Archive_Operations extends RZ_File_Manager_REST_API_Base {

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_routes() {
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
                    'unzipHere' => array(
                        'required'          => false,
                        'default'           => false,
                    ),
                ),
            )
        );
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

        return new WP_REST_Response(array('success' => true, 'message' => esc_html__('Item zipped successfully.', 'rz-file-manager')), 201); // 201 Created (as a zip file was created)
    }

    /**
     * Handles unzip request.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error Response object on success, or WP_Error on failure.
     */
    public function handle_unzip_request(WP_REST_Request $request) {
        $path = $request->get_param('path');
        $unzip_here = $request->get_param('unzipHere') ?? false;
        $unzip_here = filter_var($unzip_here, FILTER_VALIDATE_BOOLEAN);

        // Use the filesystem method to extract the zip, passing the unzip_here flag
        $result = $this->filesystem->extract_zip($path, $unzip_here);

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

        return new WP_REST_Response(array('success' => true, 'message' => esc_html__('Archive extracted successfully.', 'rz-file-manager')), 200); // 200 OK
    }
}
