<?php
/**
 * Auto-login wrapper for Adminer using WordPress credentials.
 * Includes Adminer directly instead of redirecting via form post.
 */

// Bootstrap WordPress
// Ensure this path correctly points to wp-load.php relative to this file's location.
$wp_load_path = dirname(__FILE__, 5) . '/wp-load.php'; 
if (file_exists($wp_load_path)) {
    require_once $wp_load_path;
} else {
    // Attempt relative path from plugin root if the above fails (adjust as necessary)
    $wp_load_path_alt = dirname(__FILE__, 3) . '/../../../wp-load.php';
    if (file_exists($wp_load_path_alt)) {
         require_once $wp_load_path_alt;
    } else {
         die('Could not locate wp-load.php');
    }
}


// Restrict to administrators
if (!current_user_can('manage_options')) {
    wp_die(__('Unauthorized', 'rz-file-manager'));
}

// --- Prepare Adminer Auto-Login ---

// Set POST variables for Adminer auto-login
$_POST['auth'] = array(
    'driver'   => 'server', // Or mysql, mysqli depending on your setup, 'server' usually works
    'server'   => defined('DB_HOST') ? DB_HOST : 'localhost',
    'username' => defined('DB_USER') ? DB_USER : 'root',
    'password' => defined('DB_PASSWORD') ? DB_PASSWORD : '',
    'db'       => defined('DB_NAME') ? DB_NAME : '',
);

// --- Include Adminer ---

// Define path to the actual Adminer script
$adminer_path = RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/vendor/adminer.php';

if (file_exists($adminer_path)) {
    // Include and execute the Adminer script.
    // It will use the $_POST['auth'] variables we just set.
    include $adminer_path; 
    exit; // Stop further script execution
} else {
    wp_die('Adminer script not found at: ' . esc_html($adminer_path));
}

// No HTML output needed anymore.
