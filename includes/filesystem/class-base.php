<?php
/**
 * Filesystem Base class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Filesystem Base class.
 *
 * This class handles core filesystem operations using the WordPress Filesystem API.
 */
class RZ_File_Manager_Filesystem_Base {

    /**
     * WordPress Filesystem instance.
     *
     * @var WP_Filesystem_Base
     */
    protected $filesystem;

    /**
     * Root path for file operations.
     *
     * @var string
     */
    protected $root_path;

    /**
     * Flag for filesystem initialization status.
     *
     * @var bool
     */
    protected $is_initialized = false;

    /**
     * Constructor.
     *
     * @param string|null $root_path The root path to use. If null, reads from options or defaults to uploads.
     */
    public function __construct($root_path = null) {
        global $wp_filesystem;
        if (empty($wp_filesystem)) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            if (!WP_Filesystem()) {
                // Handle error - Filesystem could not be initialized
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Log critical initialization failure
                error_log('RZ File Manager Error: Could not initialize WP Filesystem'); // Log error instead of trigger_error
                $this->is_initialized = false;
                return;
            }
        }
        $this->filesystem = $wp_filesystem;
        $this->is_initialized = true; // Filesystem initialized successfully

        // Determine and validate the root path
        $upload_dir = wp_upload_dir();
        if ($root_path !== null) {
            $this->root_path = $root_path;
        } else {
            // Fallback to options or default
            $options = get_option('rz_file_manager_options', array());
            $this->root_path = isset($options['root_path']) ? $options['root_path'] : $upload_dir['basedir'];
        }
    }

    /**
     * Initialize WordPress Filesystem.
     *
     * @return bool True if filesystem initialized successfully.
     */
    protected function initialize_filesystem() {
        // Include WordPress filesystem functionality
        if (!function_exists('WP_Filesystem')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        // Initialize the WordPress filesystem
        if (WP_Filesystem()) {
            global $wp_filesystem;
            $this->filesystem = $wp_filesystem;
            return true;
        }

        return false;
    }

    /**
     * Validate and normalize path to prevent directory traversal.
     *
     * @param string $path Path to validate.
     * @return string|WP_Error Normalized path or false if invalid.
     */
    public function validate_path($path) {
        // Normalize path separators
        $path = str_replace('\\', '/', $path);
        $path = str_replace('\\', '/', $path);

        // Remove any '../' to prevent directory traversal
        $path = preg_replace('/\.\.\//', '', $path);

        // Get absolute path
        $absolute_path = $this->root_path . '/' . ltrim($path, '/');
        $real_path = realpath($absolute_path);

        // Check if path is within root directory
        if ($real_path === false || strpos($real_path, realpath($this->root_path)) !== 0) {
            return new WP_Error('invalid_path', __('Invalid path or path traversal attempt detected.', 'rz-file-manager'), ['status' => 400]);
        }

        return $absolute_path;
    }

    /**
     * Get allowed file types from options.
     *
     * @return array Array of allowed file extensions.
     */
    protected function get_allowed_file_types() {
        $options = get_option('rz_file_manager_options', array());
        $allowed_types_string = isset($options['allowed_file_types'])
            ? $options['allowed_file_types']
            : 'jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,xls,xlsx,zip,txt,md';

        return array_map('trim', explode(',', $allowed_types_string));
    }

    /**
     * Get the root path used by the filesystem.
     *
     * @return string The root path.
     */
    public function get_root_path() {
        return $this->root_path;
    }

    /**
     * Get the WordPress filesystem instance.
     *
     * @return WP_Filesystem_Base The WordPress filesystem instance.
     */
    public function get_filesystem() {
        return $this->filesystem;
    }

    /**
     * Checks if a path is a directory using the WordPress filesystem.
     *
     * @param string $path Path to check.
     * @return bool True if it is a directory, false otherwise.
     */
    public function is_dir($path) {
        if (!$this->filesystem) {
            // Handle case where filesystem failed to initialize
            return false;
        }
        return $this->filesystem->is_dir($path);
    }
}
