<?php
/**
 * Admin class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin class.
 *
 * This class handles the admin page setup for the file manager.
 */
class RZ_File_Manager_Admin {

    /**
     * Constructor.
     */
    public function __construct() {
        // Register admin menu
        add_action('admin_menu', array($this, 'register_admin_menu'));
    }

    /**
     * Register admin menu.
     *
     * @return void
     */
    public function register_admin_menu() {
        add_menu_page(
            __('RZ File Manager', 'rz-file-manager'),
            __('RZ File Manager', 'rz-file-manager'),
            'manage_options',
            'rz-file-manager',
            array($this, 'render_admin_page'),
            'dashicons-portfolio', // Using portfolio icon for folder
            30
        );
    }

    /**
     * Render admin page.
     *
     * @return void
     */
    public function render_admin_page() {
        // Check user capabilities
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'rz-file-manager'));
        }

        // Render the app container
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            <div id="rz-file-manager-root"></div>
        </div>
        <?php
    }
}
