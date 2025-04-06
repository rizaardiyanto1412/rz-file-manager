<?php
/**
 * Uninstall RZ File Manager plugin.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete plugin options
delete_option('rz_file_manager_options');

// Delete any other options and custom tables if needed
// For example, if you added any custom database tables, you would delete them here
