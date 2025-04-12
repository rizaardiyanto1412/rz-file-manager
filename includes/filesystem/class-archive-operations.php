<?php
/**
 * Archive Operations class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Archive Operations class.
 *
 * This class handles archive-related operations.
 */
class RZ_File_Manager_Filesystem_Archive_Operations extends RZ_File_Manager_Filesystem_Base {

    /**
     * Instance of RZ_File_Manager_Archive.
     * @var RZ_File_Manager_Archive|null
     */
    private $archive_handler;

    /**
     * Constructor.
     * 
     * @param string|null $root_path The root path to use. If null, reads from options or defaults to uploads.
     */
    public function __construct($root_path = null) {
        parent::__construct($root_path);
        $this->archive_handler = new RZ_File_Manager_Archive(); // Instantiate Archive handler
    }

    /**
     * Create a zip archive of a given file or folder.
     *
     * @param string $relative_path Relative path from the root directory to the item to zip.
     * @return bool|WP_Error True on success, WP_Error on failure.
     */
    public function create_zip($relative_path) {
        $absolute_path = $this->validate_path($relative_path);
        if (!$absolute_path || !$this->filesystem->exists($absolute_path)) {
            return new WP_Error('invalid_source_path', __('Invalid or non-existent source path specified for zipping.', 'rz-file-manager'));
        }

        if (!$this->archive_handler) {
            return new WP_Error('archive_handler_not_initialized', __('Archive handler failed to initialize.', 'rz-file-manager'));
        }

        // Determine destination zip path
        $path_parts = pathinfo($absolute_path);
        $parent_dir = $path_parts['dirname'];
        $filename   = $path_parts['basename']; // Includes extension for files
        $destination_zip = trailingslashit($parent_dir) . $filename . '.zip';

        // Prevent zipping the zip file itself if it somehow exists
        if ($destination_zip === $absolute_path) {
             return new WP_Error('zip_self_recursion', __('Cannot zip an item into itself.', 'rz-file-manager'));
        }

        // Check if destination zip already exists (optional: decide whether to overwrite or error)
        // For now, we rely on ZipArchive::OVERWRITE flag set in the archive handler

        return $this->archive_handler->zip_item($absolute_path, $destination_zip);
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
         $absolute_zip_path = $this->validate_path($relative_zip_path);

         if (!$absolute_zip_path || !$this->filesystem->exists($absolute_zip_path) || !$this->filesystem->is_file($absolute_zip_path)) {
             return new WP_Error('invalid_zip_path', __('Invalid or non-existent zip file specified for extraction.', 'rz-file-manager'));
         }
         
         // Basic check for .zip extension
         if (strtolower(pathinfo($absolute_zip_path, PATHINFO_EXTENSION)) !== 'zip') {
             return new WP_Error('not_a_zip_file', __('The specified file is not a zip archive.', 'rz-file-manager'));
         }

         if (!$this->archive_handler) {
             return new WP_Error('archive_handler_not_initialized', __('Archive handler failed to initialize.', 'rz-file-manager'));
         }

         // Determine destination directory
         $path_parts = pathinfo($absolute_zip_path);
         $parent_dir = $path_parts['dirname'];

         if ($unzip_here) {
             $destination_dir = $parent_dir;
             // Note: When unzipping here, we rely on the underlying archive handler
             // to manage potential file conflicts/overwrites within the existing directory.
         } else {
             $archive_basename = $path_parts['filename']; // Name without extension
             $destination_dir = trailingslashit($parent_dir) . $archive_basename;

             // Prevent extracting into itself (though unlikely with current naming)
             if ($destination_dir === $absolute_zip_path) {
                  return new WP_Error('unzip_self_recursion', __('Cannot extract an archive into itself.', 'rz-file-manager'));
             }
             
             // Check if a file/folder with the target *new* directory name already exists
             if ($this->filesystem->exists($destination_dir)) {
                 // Decide on behavior: error out, rename (e.g., folder-1), or overwrite? 
                 // Erroring out is safest for now.
                 return new WP_Error('unzip_destination_exists', __('A file or folder with the target extraction name already exists.', 'rz-file-manager'), ['target' => $destination_dir]);
             }
         }
         
         return $this->archive_handler->unzip_item($absolute_zip_path, $destination_dir);
    }
}
