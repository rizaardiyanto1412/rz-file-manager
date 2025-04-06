<?php
/**
 * Plugin Name: RZ File Manager
 * Plugin URI: https://example.com/rz-file-manager
 * Description: A modern file manager for WordPress with a React-based interface.
 * Version: 1.0.0
 * Author: RZ
 * Author URI: https://example.com
 * Text Domain: rz-file-manager
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('RZ_FILE_MANAGER_VERSION', '1.0.0');
define('RZ_FILE_MANAGER_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('RZ_FILE_MANAGER_PLUGIN_URL', plugin_dir_url(__FILE__));
define('RZ_FILE_MANAGER_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Include the main plugin class
require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/class-rz-file-manager.php';

// Activation hook
register_activation_hook(__FILE__, array('RZ_File_Manager', 'activate'));

// Deactivation hook
register_deactivation_hook(__FILE__, array('RZ_File_Manager', 'deactivate'));

// Initialize the plugin
function rz_file_manager_init() {
    // Initialize the main plugin class
    $rz_file_manager = new RZ_File_Manager();
    $rz_file_manager->init();
}
add_action('plugins_loaded', 'rz_file_manager_init');
