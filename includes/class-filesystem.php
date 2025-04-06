<?php
/**
 * Filesystem class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Filesystem class.
 *
 * This class handles all filesystem operations using the WordPress Filesystem API.
 */
class RZ_File_Manager_Filesystem {

    /**
     * WordPress Filesystem instance.
     *
     * @var WP_Filesystem_Base
     */
    private $filesystem;

    /**
     * Root path for file operations.
     *
     * @var string
     */
    private $root_path;

    /**
     * Constructor.
     * 
     * @param string|null $root_path The root path to use. If null, reads from options or defaults to uploads.
     */
    public function __construct($root_path = null) {
        // Initialize WordPress Filesystem
        $this->initialize_filesystem();
        
        // Set root path
        if ($root_path !== null) {
            $this->root_path = $root_path;
        } else {
            // Fallback to options or default
            $options = get_option('rz_file_manager_options', array());
            $this->root_path = isset($options['root_path']) ? $options['root_path'] : wp_upload_dir()['basedir'];
        }
    }

    /**
     * Initialize WordPress Filesystem.
     *
     * @return bool True if filesystem initialized successfully.
     */
    private function initialize_filesystem() {
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
    private function validate_path($path) {
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
            if (!$this->copy_directory_recursive($source_path, $destination_path)) {
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
     * Copy directory recursively.
     *
     * @param string $source      Source directory.
     * @param string $destination Destination directory.
     * @return bool True on success or false on failure.
     */
    private function copy_directory_recursive($source, $destination) {
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
     * Get allowed file types from options.
     *
     * @return array Array of allowed file extensions.
     */
    private function get_allowed_file_types() {
        $options = get_option('rz_file_manager_options', array());
        $allowed_types_string = isset($options['allowed_file_types']) 
            ? $options['allowed_file_types'] 
            : 'jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,xls,xlsx,zip,txt,md';
        
        return array_map('trim', explode(',', $allowed_types_string));
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

        // Use readfile() for memory efficiency with large files
        readfile($absolute_path);

        exit;
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
        header('Content-Disposition: attachment; filename="' . basename($zip_path) . '"');
        header('Content-Transfer-Encoding: binary');
        header('Expires: 0');
        header('Cache-Control: must-revalidate');
        header('Pragma: public');
        header('Content-Length: ' . $filesize);

        // Clear output buffer
        if (ob_get_level()) {
            ob_end_clean();
        }

        readfile($zip_path);
        
        // Delete the temporary zip file
        unlink($zip_path);

        exit;
    }
}
