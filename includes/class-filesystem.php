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

// Include required files
require_once __DIR__ . '/class-archive.php'; // Include the Archive handler
require_once __DIR__ . '/filesystem/class-base.php';
require_once __DIR__ . '/filesystem/class-directory-operations.php';
require_once __DIR__ . '/filesystem/class-file-operations.php';
require_once __DIR__ . '/filesystem/class-item-operations.php';
require_once __DIR__ . '/filesystem/class-bulk-operations.php';
require_once __DIR__ . '/filesystem/class-archive-operations.php';

/**
 * Filesystem class.
 *
 * This class handles all filesystem operations using the WordPress Filesystem API.
 * It delegates operations to specialized classes.
 */
class RZ_File_Manager_Filesystem {

    /**
     * Directory operations instance.
     *
     * @var RZ_File_Manager_Filesystem_Directory_Operations
     */
    private $directory_operations;

    /**
     * File operations instance.
     *
     * @var RZ_File_Manager_Filesystem_File_Operations
     */
    private $file_operations;

    /**
     * Item operations instance.
     *
     * @var RZ_File_Manager_Filesystem_Item_Operations
     */
    private $item_operations;

    /**
     * Bulk operations instance.
     *
     * @var RZ_File_Manager_Filesystem_Bulk_Operations
     */
    private $bulk_operations;

    /**
     * Archive operations instance.
     *
     * @var RZ_File_Manager_Filesystem_Archive_Operations
     */
    private $archive_operations;

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
        // Initialize all operation classes with the same root path
        $this->directory_operations = new RZ_File_Manager_Filesystem_Directory_Operations($root_path);
        $this->file_operations = new RZ_File_Manager_Filesystem_File_Operations($root_path);
        $this->item_operations = new RZ_File_Manager_Filesystem_Item_Operations($root_path);
        $this->bulk_operations = new RZ_File_Manager_Filesystem_Bulk_Operations($root_path);
        $this->archive_operations = new RZ_File_Manager_Filesystem_Archive_Operations($root_path);

        // Store root path for reference
        $this->root_path = $this->directory_operations->get_root_path();
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
     * Validate and normalize path to prevent directory traversal.
     *
     * @param string $path Path to validate.
     * @return string|WP_Error Normalized path or false if invalid.
     */
    public function validate_path($path) {
        return $this->directory_operations->validate_path($path);
    }

    /**
     * List files and directories in a given path.
     *
     * @param string $path Path to list.
     * @return array|WP_Error Array of files and directories or WP_Error on failure.
     */
    public function list_directory($path = '') {
        return $this->directory_operations->list_directory($path);
    }

    /**
     * Create a new directory.
     *
     * @param string $path Path where directory should be created.
     * @param string $name Name of the directory.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function create_directory($path, $name) {
        return $this->directory_operations->create_directory($path, $name);
    }

    /**
     * Upload a file.
     *
     * @param string $path Path where file should be uploaded.
     * @param array  $file File data from $_FILES.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function upload_file($path, $file) {
        return $this->file_operations->upload_file($path, $file);
    }

    /**
     * Delete a file or directory.
     *
     * @param string $path Path to delete.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function delete($path) {
        return $this->item_operations->delete($path);
    }

    /**
     * Rename a file or directory.
     *
     * @param string $path    Path to rename.
     * @param string $new_name New name.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function rename($path, $new_name) {
        return $this->item_operations->rename($path, $new_name);
    }

    /**
     * Get file content.
     *
     * @param string $path Path to file.
     * @return string|WP_Error File content or WP_Error on failure.
     */
    public function get_file_content($path) {
        return $this->file_operations->get_file_content($path);
    }

    /**
     * Save file content.
     *
     * @param string $path    Path to file.
     * @param string $content File content.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function save_file_content($path, $content) {
        return $this->file_operations->save_file_content($path, $content);
    }

    /**
     * Copy a file or directory.
     *
     * @param string $source      Source path.
     * @param string $destination Destination path.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function copy($source, $destination) {
        return $this->item_operations->copy($source, $destination);
    }

    /**
     * Move a file or directory.
     *
     * @param string $source      Source path.
     * @param string $destination Destination path.
     * @return bool|WP_Error True on success or WP_Error on failure.
     */
    public function move($source, $destination) {
        return $this->item_operations->move($source, $destination);
    }

    /**
     * Send a file to the browser for download.
     *
     * @param string $path Relative path to the file.
     * @return void|WP_Error Outputs file or returns WP_Error on failure.
     */
    public function download_file($path) {
        return $this->file_operations->download_file($path);
    }

    /**
     * Create a zip archive of a directory and send it for download.
     *
     * @param string $path Relative path to the directory.
     * @return void|WP_Error Outputs zip file or returns WP_Error on failure.
     */
    public function download_directory_as_zip($path) {
        return $this->directory_operations->download_directory_as_zip($path);
    }

    /**
     * Create a zip archive of a given file or folder.
     *
     * @param string $relative_path Relative path from the root directory to the item to zip.
     * @return bool|WP_Error True on success, WP_Error on failure.
     */
    public function create_zip($relative_path) {
        return $this->archive_operations->create_zip($relative_path);
    }

    /**
     * Extracts a zip archive.
     * By default, extracts into a new directory named after the archive.
     * If $unzip_here is true, extracts directly into the parent directory.
     *
     * @param string $relative_zip_path Relative path from the root directory to the zip file.
     * @param bool $unzip_here Whether to extract directly into the parent directory.
     * @return bool|WP_Error True on success, WP_Error on failure.
     */
    public function extract_zip($relative_zip_path, $unzip_here = false) {
        return $this->archive_operations->extract_zip($relative_zip_path, $unzip_here);
    }

    /**
     * Checks if a path is a directory using the WordPress filesystem.
     *
     * @param string $path Path to check.
     * @return bool True if it is a directory, false otherwise.
     */
    public function is_dir($path) {
        return $this->directory_operations->is_dir($path);
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
        return $this->item_operations->copy_item($source_relative, $destination_relative);
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
        return $this->item_operations->move_item($source_relative, $destination_relative);
    }

    /**
     * Deletes multiple files or directories.
     *
     * @param array $paths Array of paths to delete.
     * @return bool|WP_Error True on success, WP_Error on failure.
     */
    public function delete_bulk($paths) {
        return $this->bulk_operations->delete_bulk($paths);
    }

    /**
     * Check if a file or directory exists.
     *
     * @param string $path Path to check.
     * @return bool True if the file or directory exists, false otherwise.
     */
    public function exists($path) {
        // Delegate to the WordPress filesystem
        return $this->file_operations->get_filesystem()->exists($path);
    }

    /**
     * Write contents to a file.
     *
     * @param string $file     The file to write to.
     * @param string $contents The contents to write to the file.
     * @return bool True on success, false on failure.
     */
    public function put_contents($file, $contents) {
        // Delegate to the WordPress filesystem
        return $this->file_operations->get_filesystem()->put_contents($file, $contents);
    }
}
