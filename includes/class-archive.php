<?php
/**
 * Handles zip and unzip operations for the RZ File Manager.
 * 
 * @package RZ_File_Manager
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly.
}

/**
 * RZ_File_Manager_Archive Class.
 *
 * Uses ZipArchive to create and extract zip files.
 */
class RZ_File_Manager_Archive {

    /**
     * Instance of WP_Filesystem_Base.
     * @var WP_Filesystem_Base|null
     */
    private $filesystem = null;

    /**
     * Constructor. Initializes the filesystem.
     */
    public function __construct() {
        global $wp_filesystem;
        if (empty($wp_filesystem)) {
            require_once ABSPATH . '/wp-admin/includes/file.php';
            WP_Filesystem();
        }
        $this->filesystem = $wp_filesystem;
    }
    
    /**
     * Checks if the ZipArchive class exists.
     *
     * @return bool True if ZipArchive exists, false otherwise.
     */
    public function is_zip_supported() {
        return class_exists('ZipArchive');
    }

    /**
     * Creates a zip archive of a given file or directory.
     *
     * @param string $source_path Absolute path to the source file or directory.
     * @param string $destination_zip Absolute path for the destination zip file.
     * @return bool|WP_Error True on success, WP_Error on failure.
     */
    public function zip_item($source_path, $destination_zip) {
        if (!$this->is_zip_supported()) {
            return new WP_Error('zip_not_supported', __('PHP ZipArchive extension is required but not enabled on the server.', 'rz-file-manager'));
        }
        
        if (!$this->filesystem || !$this->filesystem->exists($source_path)) {
            return new WP_Error('source_not_found', __('Source file or directory not found.', 'rz-file-manager'));
        }
    
        $zip = new ZipArchive();
        $result = $zip->open($destination_zip, ZipArchive::CREATE | ZipArchive::OVERWRITE);
    
        if ($result !== true) {
            return new WP_Error('zip_open_failed', __('Could not open zip file for writing.', 'rz-file-manager'), ['error_code' => $result]);
        }
    
        $source_path = rtrim($source_path, DIRECTORY_SEPARATOR);
    
        if ($this->filesystem->is_file($source_path)) {
            if (!$zip->addFile($source_path, basename($source_path))) {
                $zip->close();
                return new WP_Error('zip_add_file_failed', __('Could not add file to zip archive.', 'rz-file-manager'));
            }
        } elseif ($this->filesystem->is_dir($source_path)) {
            $files = new RecursiveIteratorIterator(
                new RecursiveDirectoryIterator($source_path, RecursiveDirectoryIterator::SKIP_DOTS),
                RecursiveIteratorIterator::SELF_FIRST
            );
    
            $zip->addEmptyDir(basename($source_path));
    
            foreach ($files as $file) {
                $realPath = $file->getRealPath();
                $relativePath = basename($source_path) . DIRECTORY_SEPARATOR . substr($realPath, strlen($source_path) + 1);
    
                if ($file->isDir()) {
                    if (!$zip->addEmptyDir($relativePath)) {
                        $zip->close();
                        return new WP_Error('zip_add_dir_failed', __('Could not add directory to zip archive.', 'rz-file-manager'), ['path' => $relativePath]);
                    }
                } elseif ($file->isFile()) {
                    if (!$zip->addFile($realPath, $relativePath)) {
                        $zip->close();
                        return new WP_Error('zip_add_file_failed', __('Could not add file to zip archive.', 'rz-file-manager'), ['path' => $relativePath]);
                    }
                }
            }
        } else {
            $zip->close();
            return new WP_Error('invalid_source_type', __('Source is neither a file nor a directory.', 'rz-file-manager'));
        }
    
        if (!$zip->close()) {
            return new WP_Error('zip_close_failed', __('Could not close the zip archive.', 'rz-file-manager'));
        }
    
        return true;
    }

    /**
     * Extracts a zip archive to a specified destination directory.
     *
     * @param string $source_zip Absolute path to the source zip file.
     * @param string $destination_dir Absolute path to the directory where contents should be extracted.
     * @return bool|WP_Error True on success, WP_Error on failure.
     */
    public function unzip_item($source_zip, $destination_dir) {
         if (!$this->is_zip_supported()) {
            return new WP_Error('zip_not_supported', __('PHP ZipArchive extension is required but not enabled on the server.', 'rz-file-manager'));
        }
        
        if (!$this->filesystem || !$this->filesystem->exists($source_zip) || !$this->filesystem->is_file($source_zip)) {
             return new WP_Error('zip_not_found', __('Zip archive not found or is not a file.', 'rz-file-manager'));
        }

        // Ensure destination directory exists and is writable
        if (!$this->filesystem->exists($destination_dir)) {
            if (!wp_mkdir_p($destination_dir)) {
                 return new WP_Error('unzip_mkdir_failed', __('Could not create destination directory for extraction.', 'rz-file-manager'));
            }
        } elseif (!$this->filesystem->is_dir($destination_dir) || !$this->filesystem->is_writable($destination_dir)) {
            return new WP_Error('unzip_dest_not_writable', __('Destination directory is not writable or is not a directory.', 'rz-file-manager'));
        }

        $zip = new ZipArchive();
        $result = $zip->open($source_zip);

        if ($result !== true) {
            return new WP_Error('zip_open_failed', __('Could not open zip archive for reading.', 'rz-file-manager'), ['error_code' => $result]);
        }

        if (!$zip->extractTo($destination_dir)) {
             $zip_status = $zip->status; // Get status before closing
             $zip->close();
             return new WP_Error('unzip_extract_failed', __('Could not extract zip archive.', 'rz-file-manager'), ['status' => $zip_status]);
        }

        if (!$zip->close()) {
             // This usually indicates an issue occurred during extraction as well.
             return new WP_Error('unzip_close_failed', __('Could not close the zip archive after extraction.', 'rz-file-manager'));
        }

        return true;
    }
}
