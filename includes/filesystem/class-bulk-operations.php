<?php
/**
 * Bulk Operations class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Bulk Operations class.
 *
 * This class handles operations that can be performed on multiple files and directories.
 */
class RZ_File_Manager_Filesystem_Bulk_Operations extends RZ_File_Manager_Filesystem_Base {

    /**
     * Deletes multiple files or directories.
     *
     * @param array $paths Array of paths to delete.
     * @return bool|WP_Error True on success, WP_Error on failure.
     */
    public function delete_bulk($paths) {
        // Validate paths
        foreach ($paths as $path) {
            $absolute_path = $this->validate_path($path);
            if (!$absolute_path) {
                return new WP_Error('invalid_path', __('Invalid path specified.', 'rz-file-manager'));
            }
        }

        // Delete each path
        foreach ($paths as $path) {
            $absolute_path = $this->validate_path($path);
            if (!$this->filesystem->exists($absolute_path)) {
                return new WP_Error('not_found', __('File or directory not found.', 'rz-file-manager'));
            }

            // Delete file or directory
            if ($this->filesystem->is_dir($absolute_path)) {
                // Delete directory recursively
                if (!$this->filesystem->rmdir($absolute_path, true)) {
                    return new WP_Error('delete_failed', __('Failed to delete directory.', 'rz-file-manager'));
                }
            } else {
                // Delete file
                if (!$this->filesystem->delete($absolute_path)) {
                    return new WP_Error('delete_failed', __('Failed to delete file.', 'rz-file-manager'));
                }
            }
        }

        return true;
    }
}
