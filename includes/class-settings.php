<?php
/**
 * Plugin settings handler for RZ File & DB Manager.
 */

if (!defined('ABSPATH')) {
    exit;
}

class RZ_File_DB_Manager_Settings {
    const OPTION_NAME = 'rz_file_db_manager_settings';

    /**
     * Default settings values.
     *
     * @var array
     */
    private $defaults = array(
        'file_manager_enabled' => true,
        'db_manager_enabled'   => true,
    );

    /**
     * Constructor: initialize settings on init and register form handler.
     */
    public function __construct() {
        add_action('init', array($this, 'maybe_initialize_options'));
        add_action('admin_post_rz_save_settings', array($this, 'handle_form_submission'));
    }

    /**
     * Add option if not exists.
     */
    public function maybe_initialize_options() {
        if (get_option(self::OPTION_NAME) === false) {
            add_option(self::OPTION_NAME, $this->defaults);
        }
    }

    /**
     * Get all settings with defaults.
     *
     * @return array
     */
    public function get_settings() {
        return wp_parse_args(
            get_option(self::OPTION_NAME, array()),
            $this->defaults
        );
    }

    /**
     * Check if File Manager module is enabled.
     *
     * @return bool
     */
    public function is_file_manager_enabled() {
        return (bool) $this->get_settings()['file_manager_enabled'];
    }

    /**
     * Check if DB Manager module is enabled.
     *
     * @return bool
     */
    public function is_db_manager_enabled() {
        return (bool) $this->get_settings()['db_manager_enabled'];
    }

    /**
     * Update settings.
     *
     * @param array $new_settings
     * @return bool
     */
    public function update_settings($new_settings) {
        $settings = $this->get_settings();
        $updated  = wp_parse_args($new_settings, $settings);
        return update_option(self::OPTION_NAME, $updated);
    }

    /**
     * Handle settings form submission.
     */
    public function handle_form_submission() {
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'rz-file-manager'));
        }
        check_admin_referer('rz_manager_settings_save');
        $new = array(
            'file_manager_enabled' => isset($_POST['settings']['file_manager_enabled']),
            'db_manager_enabled'   => isset($_POST['settings']['db_manager_enabled']),
        );
        $this->update_settings($new);
        wp_safe_redirect(add_query_arg('page', 'rz-manager-settings', admin_url('admin.php')));
        exit;
    }
}
