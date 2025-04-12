<?php
/**
 * Copy/Move Operations REST API class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Copy/Move Operations REST API class.
 *
 * This class handles the REST API endpoints for copy and move operations.
 */
class RZ_File_Manager_REST_API_Copy_Move_Operations extends RZ_File_Manager_REST_API_Base {

    /**
     * Register REST API routes.
     *
     * @return void
     */
    public function register_routes() {
        // Register route for copying files and directories
        register_rest_route(
            $this->namespace,
            '/copy',
            array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array($this, 'handle_copy_request'),
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
                'callback'            => array($this, 'handle_move_request'),
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
                'message' => esc_html__('Item copied successfully.', 'rz-file-manager'),
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
                'message' => esc_html__('Item moved successfully.', 'rz-file-manager'),
            ),
            200
        );
    }

    /**
     * Handles the REST API request to copy an item.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error
     */
    public function handle_copy_request(WP_REST_Request $request) {
        try {
            $source = $request->get_param('source');
            $destination = $request->get_param('destination');

            if (empty($source) || empty($destination)) {
                return new WP_Error('missing_parameter', __('Missing source or destination path.', 'rz-file-manager'), array('status' => 400));
            }

            $result = $this->filesystem->copy_item($source, $destination);

            if ($result) {
                return new WP_REST_Response(array('success' => true, 'message' => esc_html__('Item copied successfully.', 'rz-file-manager')), 200);
            } else {
                // Should be caught by exception
                return new WP_Error('copy_failed', __('Failed to copy item (unknown reason).', 'rz-file-manager'), array('status' => 500));
            }
        } catch (\Exception $e) {
            $status_code = 500;
            if (strpos($e->getMessage(), 'already exists') !== false) {
                $status_code = 409; // Conflict
            } elseif (strpos($e->getMessage(), 'outside the allowed directory') !== false || strpos($e->getMessage(), 'Invalid path') !== false) {
                $status_code = 400; // Bad request
            }
            return new WP_Error('copy_error', $e->getMessage(), array('status' => $status_code));
        }
    }

    /**
     * Handles the REST API request to move an item.
     *
     * @param WP_REST_Request $request Full details about the request.
     * @return WP_REST_Response|WP_Error
     */
    public function handle_move_request(WP_REST_Request $request) {
        try {
            $source = $request->get_param('source');
            $destination = $request->get_param('destination');

            if (empty($source) || empty($destination)) {
                return new WP_Error('missing_parameter', __('Missing source or destination path.', 'rz-file-manager'), array('status' => 400));
            }

            $result = $this->filesystem->move_item($source, $destination);

            if ($result) {
                return new WP_REST_Response(array('success' => true, 'message' => esc_html__('Item moved successfully.', 'rz-file-manager')), 200);
            } else {
                // Should be caught by exception
                return new WP_Error('move_failed', __('Failed to move item (unknown reason).', 'rz-file-manager'), array('status' => 500));
            }
        } catch (\Exception $e) {
            $status_code = 500;
            if (strpos($e->getMessage(), 'already exists') !== false) {
                $status_code = 409; // Conflict
            } elseif (strpos($e->getMessage(), 'outside the allowed directory') !== false || strpos($e->getMessage(), 'Invalid path') !== false) {
                $status_code = 400; // Bad request
            }
            return new WP_Error('move_error', $e->getMessage(), array('status' => $status_code));
        }
    }
}
