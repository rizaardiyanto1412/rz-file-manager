<?php
/**
 * Directory Operations class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Directory Operations class.
 *
 * This class handles directory-specific operations.
 */
class RZ_File_Manager_Filesystem_Directory_Operations extends RZ_File_Manager_Filesystem_Base {

    /**
     * List files and directories in a given path.
     *
     * @param string $path Path to list.
     * @return array|WP_Error Array of files and directories or WP_Error on failure.
     */
    public function list_directory($path = '') {
        // Validate path
        $absolute_path = $this->validate_path($path);
        if (!$absolute_path) {
            return new WP_Error('invalid_path', __('Invalid path specified.', 'rz-file-manager'));
        }
        
        // Check if directory exists
        if (!$this->filesystem->is_dir($absolute_path)) {
            return new WP_Error('directory_not_found', __('Directory not found.', 'rz-file-manager'));
        }
        
        // Get directory contents
        $dir_contents = $this->filesystem->dirlist($absolute_path);
        if (!$dir_contents) {
            return array();
        }
        
        $items = array();
        foreach ($dir_contents as $name => $info) {
            $items[] = array(
                'name' => $name,
                'type' => $info['type'] === 'd' ? 'directory' : 'file',
                'size' => isset($info['size']) ? $info['size'] : 0,
                'modified' => isset($info['lastmodunix']) ? $info['lastmodunix'] : 0,
                'path' => trailingslashit($path) . $name,
            );
        }
        
        return $items;
    }

    /**
     * Create a new directory.
     *
     * @param string $path Path where directory should be created.
     * @param string $name Name of the directory.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function create_directory($path, $name) {
        // Validate path
        $absolute_path = $this->validate_path($path);
        if (!$absolute_path) {
            return new WP_Error('invalid_path', __('Invalid path specified.', 'rz-file-manager'));
        }
        
        // Sanitize directory name
        $name = sanitize_file_name($name);
        if (empty($name)) {
            return new WP_Error('invalid_name', __('Invalid directory name.', 'rz-file-manager'));
        }
        
        // Create full path
        $new_dir_path = trailingslashit($absolute_path) . $name;
        
        // Check if directory already exists
        if ($this->filesystem->is_dir($new_dir_path)) {
            return new WP_Error('directory_exists', __('Directory already exists.', 'rz-file-manager'));
        }
        
        // Create directory
        if (!$this->filesystem->mkdir($new_dir_path)) {
            return new WP_Error('create_failed', __('Failed to create directory.', 'rz-file-manager'));
        }
        
        return true;
    }

    /**
     * Copy directory recursively.
     *
     * @param string $source      Source directory.
     * @param string $destination Destination directory.
     * @return bool True on success or false on failure.
     */
    public function copy_directory_recursive($source, $destination) {
        // Create destination directory
        if (!$this->filesystem->mkdir($destination)) {
            return false;
        }
        
        // Get directory contents
        $dir_contents = $this->filesystem->dirlist($source);
        if (!$dir_contents) {
            return true; // Empty directory
        }
        
        // Copy each item
        foreach ($dir_contents as $name => $info) {
            $source_item = trailingslashit($source) . $name;
            $destination_item = trailingslashit($destination) . $name;
            
            if ($info['type'] === 'd') {
                // Recursively copy subdirectory
                if (!$this->copy_directory_recursive($source_item, $destination_item)) {
                    return false;
                }
            } else {
                // Copy file
                if (!$this->filesystem->copy($source_item, $destination_item)) {
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Create a zip archive of a directory and send it for download.
     *
     * @param string $path Relative path to the directory.
     * @return void|WP_Error Outputs zip file or returns WP_Error on failure.
     */
    public function download_directory_as_zip($path) {
        global $wp_filesystem;

        $absolute_path = $this->validate_path($path);
        if (is_wp_error($absolute_path)) {
            return $absolute_path; // Return the WP_Error object
        }

        if (!$wp_filesystem->is_dir($absolute_path)) {
            return new WP_Error('not_a_directory', __('Path is not a directory.', 'rz-file-manager'));
        }

        $zip = new ZipArchive();
        $zip_path = wp_tempnam(basename($path) . '.zip'); // Use wp_tempnam for a unique temp file

        $res = $zip->open($zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE);

        if ($res !== TRUE) {
            return new WP_Error('zip_creation_failed', __('Could not create zip file.', 'rz-file-manager') . ' Error code: ' . $res);
        }

        $source_path = rtrim($absolute_path, '/'); // Ensure no trailing slash for iteration

        // Create recursive directory iterator
        $files = new RecursiveIteratorIterator(
            new RecursiveDirectoryIterator($source_path, RecursiveDirectoryIterator::SKIP_DOTS),
            RecursiveIteratorIterator::SELF_FIRST
        );

        foreach ($files as $file) {
            $file_path = realpath($file->getPathname());
            // Create relative path for the zip archive
            $relative_path = substr($file_path, strlen($source_path) + 1);

            if (empty($relative_path)) continue; // Skip the root dir itself if listed

            if ($file->isDir()) {
                // Recursively copy subdirectory
                $zip->addEmptyDir($relative_path);
            } else if ($file->isFile()) {
                // Copy file
                $zip->addFile($file_path, $relative_path);
            }
        }

        // Check if files were added (might be empty dir)
        if ($zip->numFiles === 0) {
             // Add the base directory itself if it was empty
            $zip->addEmptyDir(basename($path));
        }

        $zip->close();

        if (!$this->filesystem->exists($zip_path) || !$this->filesystem->is_readable($zip_path)) {
            $this->filesystem->delete($zip_path); // Attempt cleanup
            return new WP_Error('zip_read_failed', __('Could not read the created zip archive.', 'rz-file-manager'), ['status' => 500]);
        }

        $filesize = $this->filesystem->size($zip_path);

        // Set headers for zip download
        header('Content-Description: File Transfer');
        header('Content-Type: application/zip');
        // *** Use the original directory name for the download filename ***
        $download_filename = basename($path) . '.zip'; 
        header('Content-Disposition: attachment; filename="' . $download_filename . '"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . $filesize);

        // Clear output buffer
        if (ob_get_level()) {
            ob_end_clean();
        }

        // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_readfile
        readfile($zip_path);
        
        // Delete the temporary zip file
        if ($this->filesystem) {
            $this->filesystem->delete($zip_path);
        } else {
            // Fallback or log error if filesystem not initialized
            // phpcs:ignore WordPress.WP.AlternativeFunctions.unlink_unlink -- Fallback delete if WP_Filesystem failed
            unlink($zip_path); // Keep original as fallback, though ideally FS should be initialized
        }

        exit;
    }
}
