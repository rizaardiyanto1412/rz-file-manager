<?php
/**
 * Assets class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Assets class.
 *
 * This class handles loading of scripts and styles for the plugin.
 */
class RZ_File_Manager_Assets {

    /**
     * Constructor.
     */
    public function __construct() {
        // Register scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'register_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'));
    }

    /**
     * Register and enqueue scripts and styles.
     *
     * @param string $hook Current admin page hook.
     * @return void
     */
    public function register_assets($hook) {
        // Only load assets on our plugin page
        if ('toplevel_page_rz-file-manager' !== $hook) {
            return;
        }

        // Enqueue WordPress scripts
        wp_enqueue_script('wp-element');
        wp_enqueue_script('wp-components');
        wp_enqueue_script('wp-i18n');
        wp_enqueue_script('wp-api-fetch');

        // Enqueue WordPress styles
        wp_enqueue_style('wp-components');

        // Enqueue our styles
        wp_enqueue_style(
            'rz-file-manager-styles',
            RZ_FILE_MANAGER_PLUGIN_URL . 'assets/css/main.css',
            array('wp-components'),
            RZ_FILE_MANAGER_VERSION
        );

        // Enqueue our scripts
        wp_enqueue_script(
            'rz-file-manager-scripts',
            RZ_FILE_MANAGER_PLUGIN_URL . 'assets/js/main.js',
            array('wp-element', 'wp-api-fetch'),
            RZ_FILE_MANAGER_VERSION,
            true
        );

        // Localize script with necessary data
        wp_localize_script(
            'rz-file-manager-scripts',
            'rzFileManagerData',
            array(
                'restUrl' => esc_url_raw(rest_url('rz-file-manager/v1/')),
                'ajaxUrl'  => admin_url('admin-ajax.php'),
                'ajaxNonce' => wp_create_nonce('rz_fm_nonce'),
                'restNonce' => wp_create_nonce('wp_rest'),
                'rootPath' => $this->get_root_path(),
                'maxUploadSize' => wp_max_upload_size(),
                'allowedFileTypes' => $this->get_allowed_file_types(),
            )
        );
    }

    /**
     * Get root path from plugin options.
     *
     * @return string
     */
    private function get_root_path() {
        // WARNING: Hardcoding to ABSPATH can be risky.
        // Consider using the options system for configuration instead.
        return ABSPATH;
    }

    /**
     * Get allowed file types from plugin options.
     *
     * @return string
     */
    private function get_allowed_file_types() {
        $options = get_option('rz_file_manager_options', array());
        return isset($options['allowed_file_types'])
            ? $options['allowed_file_types']
            : 'jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,xls,xlsx,zip,txt,md';
    }

    /**
     * Enqueue admin styles for the menu icon.
     *
     * @param string $hook Current admin page hook.
     * @return void
     */
    public function enqueue_admin_styles($hook) {
        // Load admin menu styles on all admin pages
        wp_enqueue_style(
            'rz-file-manager-admin-menu',
            RZ_FILE_MANAGER_PLUGIN_URL . 'assets/css/admin-menu.css',
            array(),
            RZ_FILE_MANAGER_VERSION
        );
    }
}
