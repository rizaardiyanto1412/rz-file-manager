<?php
/**
 * File Operations class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * File Operations class.
 *
 * This class handles file-specific operations.
 */
class RZ_File_Manager_Filesystem_File_Operations extends RZ_File_Manager_Filesystem_Base {

    /**
     * Upload a file.
     *
     * @param string $path Path where file should be uploaded.
     * @param array  $file File data from $_FILES.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function upload_file($path, $file) {
        // Validate path
        $absolute_path = $this->validate_path($path);
        if (!$absolute_path) {
            return new WP_Error('invalid_path', __('Invalid path specified.', 'rz-file-manager'));
        }
        
        // Check if file was uploaded
        if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
            return new WP_Error('upload_error', __('No file was uploaded or upload failed.', 'rz-file-manager'));
        }
        
        // Sanitize filename
        $filename = sanitize_file_name($file['name']);
        if (empty($filename)) {
            return new WP_Error('invalid_filename', __('Invalid filename.', 'rz-file-manager'));
        }
        
        // Check file type
        $allowed_types = $this->get_allowed_file_types();
        $file_ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
        if (!empty($allowed_types) && !in_array($file_ext, $allowed_types)) {
            return new WP_Error('invalid_file_type', __('File type not allowed.', 'rz-file-manager'));
        }
        
        // Check file size
        $max_size = wp_max_upload_size();
        if ($file['size'] > $max_size) {
            return new WP_Error('file_too_large', __('File is too large.', 'rz-file-manager'));
        }
        
        // Create full path
        $upload_path = trailingslashit($absolute_path) . $filename;
        
        // Check if file already exists
        if ($this->filesystem->exists($upload_path)) {
            return new WP_Error('file_exists', __('File already exists.', 'rz-file-manager'));
        }
        
        // Move uploaded file
        $file_content = file_get_contents($file['tmp_name']);
        if (!$this->filesystem->put_contents($upload_path, $file_content)) {
            return new WP_Error('upload_failed', __('Failed to upload file.', 'rz-file-manager'));
        }
        
        return true;
    }

    /**
     * Get file content.
     *
     * @param string $path Path to file.
     * @return string|WP_Error File content or WP_Error on failure.
     */
    public function get_file_content($path) {
        // Validate path
        $absolute_path = $this->validate_path($path);
        if (!$absolute_path) {
            return new WP_Error('invalid_path', __('Invalid path specified.', 'rz-file-manager'));
        }
        
        // Check if file exists
        if (!$this->filesystem->exists($absolute_path) || $this->filesystem->is_dir($absolute_path)) {
            return new WP_Error('not_found', __('File not found.', 'rz-file-manager'));
        }
        
        // Get file content
        $content = $this->filesystem->get_contents($absolute_path);
        if (false === $content) {
            return new WP_Error('read_failed', __('Failed to read file.', 'rz-file-manager'));
        }
        
        return $content;
    }

    /**
     * Save file content.
     *
     * @param string $path    Path to file.
     * @param string $content File content.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function save_file_content($path, $content) {
        // Validate path
        $absolute_path = $this->validate_path($path);
        if (!$absolute_path) {
            return new WP_Error('invalid_path', __('Invalid path specified.', 'rz-file-manager'));
        }
        
        // Check if file exists
        if (!$this->filesystem->exists($absolute_path) || $this->filesystem->is_dir($absolute_path)) {
            return new WP_Error('not_found', __('File not found.', 'rz-file-manager'));
        }
        
        // Save file content
        if (!$this->filesystem->put_contents($absolute_path, $content)) {
            return new WP_Error('save_failed', __('Failed to save file.', 'rz-file-manager'));
        }
        
        return true;
    }

    /**
     * Send a file to the browser for download.
     *
     * @param string $path Relative path to the file.
     * @return void|WP_Error Outputs file or returns WP_Error on failure.
     */
    public function download_file($path) {
        $absolute_path = $this->validate_path($path);

        if (is_wp_error($absolute_path)) {
            return $absolute_path;
        }

        if (!$this->filesystem->exists($absolute_path) || $this->filesystem->is_dir($absolute_path)) {
            return new WP_Error('file_not_found', __('File not found or is a directory.', 'rz-file-manager'));
        }

        $filename = basename($path);
        $filesize = $this->filesystem->size($absolute_path);
        $filetype = wp_check_filetype($filename);
        $mime_type = $filetype['type'] ? $filetype['type'] : 'application/octet-stream';

        // Prevent caching
        header('Cache-Control: private');
        header('Pragma: private');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT'); // Date in the past

        // Set headers for download
        header('Content-Description: File Transfer');
        header('Content-Type: ' . $mime_type);
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Content-Transfer-Encoding: binary');
        header('Content-Length: ' . $filesize);
        header('Pragma: public');

        // Clear output buffer
        if (ob_get_level()) {
            ob_end_clean();
        }

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
        readfile($absolute_path);

        exit;
    }
}
