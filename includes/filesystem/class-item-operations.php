<?php
/**
 * Item Operations class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Item Operations class.
 *
 * This class handles operations that can be performed on both files and directories.
 */
class RZ_File_Manager_Filesystem_Item_Operations extends RZ_File_Manager_Filesystem_Base {

    /**
     * Delete a file or directory.
     *
     * @param string $path Path to delete.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function delete($path) {
        // Validate path
        $absolute_path = $this->validate_path($path);
        if (!$absolute_path) {
            return new WP_Error('invalid_path', __('Invalid path specified.', 'rz-file-manager'));
        }
        
        // Check if path exists
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
        
        return true;
    }

    /**
     * Rename a file or directory.
     *
     * @param string $path    Path to rename.
     * @param string $new_name New name.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function rename($path, $new_name) {
        // Validate path
        $absolute_path = $this->validate_path($path);
        if (!$absolute_path) {
            return new WP_Error('invalid_path', __('Invalid path specified.', 'rz-file-manager'));
        }
        
        // Check if path exists
        if (!$this->filesystem->exists($absolute_path)) {
            return new WP_Error('not_found', __('File or directory not found.', 'rz-file-manager'));
        }
        
        // Sanitize new name
        // $new_name = sanitize_file_name($new_name); // Remove redundant sanitization - already done by REST API args
        if (empty($new_name)) {
            return new WP_Error('invalid_name', __('Invalid name.', 'rz-file-manager'));
        }
        
        // Get directory and filename
        $dirname = dirname($absolute_path);
        $new_path = trailingslashit($dirname) . $new_name;
        
        // Check if target already exists
        if ($this->filesystem->exists($new_path)) {
            return new WP_Error('already_exists', __('A file or directory with that name already exists.', 'rz-file-manager'));
        }
        
        // Rename file or directory
        if (!$this->filesystem->move($absolute_path, $new_path)) {
            return new WP_Error('rename_failed', __('Failed to rename.', 'rz-file-manager'));
        }
        
        return true;
    }

    /**
     * Copy a file or directory.
     *
     * @param string $source      Source path.
     * @param string $destination Destination path.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function copy($source, $destination) {
        // Validate source path
        $source_path = $this->validate_path($source);
        if (!$source_path) {
            return new WP_Error('invalid_source', __('Invalid source path.', 'rz-file-manager'));
        }
        
        // Validate destination path
        $destination_path = $this->validate_path($destination);
        if (!$destination_path) {
            return new WP_Error('invalid_destination', __('Invalid destination path.', 'rz-file-manager'));
        }
        
        // Check if source exists
        if (!$this->filesystem->exists($source_path)) {
            return new WP_Error('source_not_found', __('Source file or directory not found.', 'rz-file-manager'));
        }
        
        // Check if destination exists
        if ($this->filesystem->exists($destination_path)) {
            return new WP_Error('destination_exists', __('Destination already exists.', 'rz-file-manager'));
        }
        
        // Copy file or directory
        if ($this->filesystem->is_dir($source_path)) {
            // Copy directory recursively
            $directory_operations = new RZ_File_Manager_Filesystem_Directory_Operations($this->root_path);
            if (!$directory_operations->copy_directory_recursive($source_path, $destination_path)) {
                return new WP_Error('copy_failed', __('Failed to copy directory.', 'rz-file-manager'));
            }
        } else {
            // Copy file
            if (!$this->filesystem->copy($source_path, $destination_path)) {
                return new WP_Error('copy_failed', __('Failed to copy file.', 'rz-file-manager'));
            }
        }
        
        return true;
    }

    /**
     * Move a file or directory.
     *
     * @param string $source      Source path.
     * @param string $destination Destination path.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function move($source, $destination) {
        // Validate source path
        $source_path = $this->validate_path($source);
        if (!$source_path) {
            return new WP_Error('invalid_source', __('Invalid source path.', 'rz-file-manager'));
        }
        
        // Validate destination path
        $destination_path = $this->validate_path($destination);
        if (!$destination_path) {
            return new WP_Error('invalid_destination', __('Invalid destination path.', 'rz-file-manager'));
        }
        
        // Check if source exists
        if (!$this->filesystem->exists($source_path)) {
            return new WP_Error('source_not_found', __('Source file or directory not found.', 'rz-file-manager'));
        }
        
        // Check if destination exists
        if ($this->filesystem->exists($destination_path)) {
            return new WP_Error('destination_exists', __('Destination already exists.', 'rz-file-manager'));
        }
        
        // Move file or directory
        if (!$this->filesystem->move($source_path, $destination_path)) {
            return new WP_Error('move_failed', __('Failed to move file or directory.', 'rz-file-manager'));
        }
        
        return true;
    }

    /**
     * Recursively copies a file or directory.
     *
     * @param string $source_relative      Relative path to the source item.
     * @param string $destination_relative Relative path to the destination item.
     * @return bool True on success, false on failure.
     * @throws \Exception If validation fails or copy operation fails.
     */
    public function copy_item($source_relative, $destination_relative) {
        // Validate source path
        $source_absolute = $this->validate_path($source_relative);
        if (is_wp_error($source_absolute)) {
            return $source_absolute; // Propagate the error
        }

        // Construct and validate destination path (allow non-existence, check against root)
        $norm_dest_relative = str_replace('\\', '/', $destination_relative);
        $norm_dest_relative = preg_replace('/\.\.\//', '', $norm_dest_relative); // Remove ../
        $destination_absolute = $this->root_path . '/' . ltrim($norm_dest_relative, '/');
        $destination_absolute = wp_normalize_path($destination_absolute);

        // Security check: Ensure the calculated destination is within the root path
        $normalized_root_path = wp_normalize_path($this->root_path);
        if (strpos($destination_absolute, $normalized_root_path) !== 0) {
            return new WP_Error('invalid_path', __('Destination path is outside the allowed directory.', 'rz-file-manager'));
        }

        // Check if source exists
        if (!$this->filesystem->exists($source_absolute)) {
            throw new \Exception('Source file or directory not found.');
        }

        if ($source_absolute === $destination_absolute) {
            throw new \Exception('Source and destination paths cannot be the same.');
        }

        if (file_exists($destination_absolute)) {
            throw new \Exception('Destination path already exists.');
        }

        // Ensure parent directory of destination exists
        $destination_parent = dirname($destination_absolute);
        if (!is_dir($destination_parent)) {
            // Use WP_Filesystem to create directory
            if ($this->filesystem && !$this->filesystem->mkdir($destination_parent, FS_CHMOD_DIR)) {
                throw new \Exception('Failed to create destination parent directory using WP_Filesystem.');
            }
            // Fallback/Log if filesystem not available?
        }

        if (is_dir($source_absolute)) {
            // Use WordPress function for recursive directory copy
            if (!copy_dir($source_absolute, $destination_absolute)) {
                throw new \Exception('Failed to copy directory.');
            }
        } else {
            // Use PHP function for file copy
            if (!copy($source_absolute, $destination_absolute)) {
                throw new \Exception('Failed to copy file.');
            }
        }

        return true;
    }

    /**
     * Move (renames) a file or directory.
     *
     * @param string $source_relative      Relative path to the source item.
     * @param string $destination_relative Relative path to the destination item.
     * @return bool True on success, false on failure.
     * @throws \Exception If validation fails or move operation fails.
     */
    public function move_item($source_relative, $destination_relative) {
        $source_absolute = $this->validate_path($source_relative);

        // Construct the potential absolute destination path
        $norm_dest_relative = str_replace('\\', '/', $destination_relative);
        $norm_dest_relative = preg_replace('/\.\.\//', '', $norm_dest_relative); // Remove ../
        $destination_absolute = $this->root_path . '/' . ltrim($norm_dest_relative, '/');
        // Normalize the path (resolves . and redundant slashes, but preserves non-existent segments)
        $destination_absolute = wp_normalize_path($destination_absolute);

        // Security check: Ensure the calculated destination is within the root path
        $normalized_root_path = wp_normalize_path($this->root_path);
        if (strpos($destination_absolute, $normalized_root_path) !== 0) {
            throw new \Exception('Destination path is outside the allowed directory.');
        }

        // Check if source exists
        if (!$this->filesystem->exists($source_absolute)) {
            throw new \Exception('Source file or directory not found.');
        }

        if ($source_absolute === $destination_absolute) {
            throw new \Exception('Source and destination paths cannot be the same.');
        }

        if (file_exists($destination_absolute)) {
            throw new \Exception('Destination path already exists.');
        }

        // Ensure parent directory of destination exists
        $destination_parent = dirname($destination_absolute);
        if (!is_dir($destination_parent)) {
            // Use WP_Filesystem to create directory
            if ($this->filesystem && !$this->filesystem->mkdir($destination_parent, FS_CHMOD_DIR)) {
                throw new \Exception('Failed to create destination parent directory using WP_Filesystem.');
            }
            // Fallback/Log if filesystem not available?
        }

        // Use WP_Filesystem::move() for renaming/moving files and directories
        if ($this->filesystem && !$this->filesystem->move($source_absolute, $destination_absolute, true)) { // true = overwrite
            throw new \Exception('Failed to move item using WP_Filesystem.'); 
        }

        return true;
    }
}
