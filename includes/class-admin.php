<?php
/**
 * Admin class for RZ File Manager.
 *
 * Adds the top‑level “RZ Manager” menu plus three sub‑menus:
 *   – File Manager (existing React UI)
 *   – Database Manager (launches bundled phpMyAdmin)
 *   – Settings (toggle cards to enable / disable the two features)
 *
 * All pages require the `manage_options` capability.
 * Settings are stored in the single option `rzfm_settings`.
 * A hidden submenu (`rz-db-phpmyadmin`) embeds phpMyAdmin in an iframe.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

class RZ_File_Manager_Admin {

    /** @var array Plugin settings */
    private $settings = array();

    public function __construct() {
        // Load settings or default ones.
        $this->settings = get_option(
            'rzfm_settings',
            array(
                'enable_file_manager' => 1,
                'enable_db_manager'   => 1,
            )
        );

        add_action('admin_menu', array($this, 'register_admin_menu'));
        add_action('admin_init', array($this, 'maybe_save_settings'));
    }

    /**
     * Register top‑level and sub‑menus.
     */
    public function register_admin_menu() {
        // Top‑level – always visible.
        add_menu_page(
            __('RZ Manager', 'rz-file-manager'),
            __('RZ Manager', 'rz-file-manager'),
            'manage_options',
            'rz-manager',
            array($this, 'render_manager_dashboard'),
            'dashicons-admin-generic',
            30
        );

        // File Manager – existing page.
        if ((int) $this->settings['enable_file_manager'] === 1) {
            add_submenu_page(
                'rz-manager',
                __('File Manager', 'rz-file-manager'),
                __('File Manager', 'rz-file-manager'),
                'manage_options',
                'rz-file-manager',
                array($this, 'render_file_manager_page')
            );
        }

        // Database Manager.
        if ((int) $this->settings['enable_db_manager'] === 1) {
            add_submenu_page(
                'rz-manager',
                __('Database Manager', 'rz-file-manager'),
                __('Database Manager', 'rz-file-manager'),
                'manage_options',
                'rz-db-manager',
                array($this, 'render_db_manager_page')
            );
        }

        // Settings – always visible.
        add_submenu_page(
            'rz-manager',
            __('Settings', 'rz-file-manager'),
            __('Settings', 'rz-file-manager'),
            'manage_options',
            'rz-manager-settings',
            array($this, 'render_settings_page')
        );
    }

    /* --------------------------------------------------------------------- */
    /*  Render callbacks                                                     */
    /* --------------------------------------------------------------------- */

    public function render_manager_dashboard() {
        // Fallback: load File Manager if enabled, else Settings.
        if ((int) $this->settings['enable_file_manager'] === 1) {
            $this->render_file_manager_page();
        } else {
            $this->render_settings_page();
        }
    }

    public function render_file_manager_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'rz-file-manager'));
        }
        echo '<div class="wrap"><h1>' . esc_html(get_admin_page_title()) . '</h1><div id="rz-file-manager-root"></div></div>';
    }

    public function render_db_manager_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'rz-file-manager'));
        }
        $pma_url = $this->ensure_phpmyadmin_instance();
        echo '<div class="wrap"><h1>' . esc_html__('Database Manager', 'rz-file-manager') . '</h1>';
        echo '<p>' . esc_html__('Launch phpMyAdmin to manage the current WordPress database. This will open in a new tab.', 'rz-file-manager') . '</p>';
        echo '<a href="' . esc_url($pma_url) . '" class="button button-primary" target="_blank">' . esc_html__('Open phpMyAdmin', 'rz-file-manager') . '</a></div>';
    }

    /* --------------------------------------------------------------------- */
    /*  Helper: ensure phpMyAdmin is copied into lib/ and return its URL     */
    /* --------------------------------------------------------------------- */

    private function ensure_phpmyadmin_instance() {
        $stored_relative = get_option('rzfm_pma_path'); // e.g. lib/phpmyadmin_xxxxx

        $base_dir  = RZ_FILE_MANAGER_PLUGIN_DIR;
        $base_url  = RZ_FILE_MANAGER_PLUGIN_URL;

        // Check existing path
        if ($stored_relative && file_exists($base_dir . $stored_relative . '/index.php')) {
            $this->maybe_write_config($base_dir . $stored_relative . '/');
            return $base_url . $stored_relative . '/index.php';
        }

        // Need to create a new copy.
        $unique = 'lib/phpmyadmin_' . wp_generate_password(8, false, false);
        $target_dir = $base_dir . $unique;

        // Source is composer vendor path.
        $source_dir = $base_dir . 'vendor/phpmyadmin/phpmyadmin/';

        if (!file_exists($source_dir . 'index.php')) {
            wp_die(__('phpMyAdmin source not found in vendor directory.', 'rz-file-manager'));
        }

        // Use WordPress copy_dir helper.
        if (!function_exists('copy_dir')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        // Ensure lib directory exists.
        wp_mkdir_p(dirname($target_dir));

        copy_dir($source_dir, $target_dir);

        // Write config.
        $this->maybe_write_config($target_dir . '/');

        // Save option for future.
        update_option('rzfm_pma_path', $unique);

        $db_name_q = defined('DB_NAME') ? rawurlencode(DB_NAME) : '';
        return $base_url . $unique . '/index.php?db=' . $db_name_q . '&target=db_structure.php';
    }

    private function maybe_write_config($pma_dir) {
        $config = $pma_dir . 'config.inc.php';
        $needs_write = true;
        if (file_exists($config)) {
            $contents = file_get_contents($config);
            if ($contents !== false && strpos($contents, 'DB_USER') === false) {
                $needs_write = false; // already valid
            }
        }

        if ($needs_write) {
            $db_user = addslashes(defined('DB_USER') ? DB_USER : '');
            $db_pass = addslashes(defined('DB_PASSWORD') ? DB_PASSWORD : '');
            $db_host = addslashes(defined('DB_HOST') ? DB_HOST : 'localhost');
            $db_name = addslashes(defined('DB_NAME') ? DB_NAME : '');
            $cfg = "<?php\n/* Auto‑generated by RZ File Manager */\n\$cfg = array();\n\$i = 1;\n\$cfg['Servers'][\$i]['auth_type'] = 'config';\n\$cfg['Servers'][\$i]['user']      = '{$db_user}';\n\$cfg['Servers'][\$i]['password']  = '{$db_pass}';\n\$cfg['Servers'][\$i]['host']      = '{$db_host}';\n\$cfg['Servers'][\$i]['only_db']   = '{$db_name}';\n\$cfg['Servers'][\$i]['AllowNoPassword'] = true;\n\$cfg['Servers'][\$i]['connect_type'] = 'tcp';\n\$cfg['Servers'][\$i]['extension'] = 'mysqli';\n?>";
            @file_put_contents($config, $cfg);
        }
    }

    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'rz-file-manager'));
        }
        // Refresh settings in case they were just saved.
        $this->settings = get_option('rzfm_settings', array('enable_file_manager' => 1, 'enable_db_manager' => 1));
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('RZ Manager Settings', 'rz-file-manager'); ?></h1>
            <form method="post">
                <?php wp_nonce_field('rzfm_save_settings', 'rzfm_settings_nonce'); ?>
                <div class="rzfm-card">
                    <h2><?php esc_html_e('File Manager', 'rz-file-manager'); ?></h2>
                    <label class="rzfm-switch">
                        <input type="checkbox" name="enable_file_manager" value="1" <?php checked($this->settings['enable_file_manager'], 1); ?> />
                        <span class="rzfm-slider"></span>
                    </label>
                </div>
                <div class="rzfm-card">
                    <h2><?php esc_html_e('Database Manager', 'rz-file-manager'); ?></h2>
                    <label class="rzfm-switch">
                        <input type="checkbox" name="enable_db_manager" value="1" <?php checked($this->settings['enable_db_manager'], 1); ?> />
                        <span class="rzfm-slider"></span>
                    </label>
                </div>
                <?php submit_button(__('Save Changes', 'rz-file-manager')); ?>
            </form>
        </div>
        <style>
            .rzfm-card{background:#fff;padding:20px;margin:20px 0;border:1px solid #ccd0d4;border-radius:6px;display:flex;justify-content:space-between;align-items:center}
            .rzfm-switch{position:relative;display:inline-block;width:50px;height:24px}
            .rzfm-slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s;border-radius:24px}
            .rzfm-slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background-color:#fff;transition:.4s;border-radius:50%}
            input:checked+.rzfm-slider{background-color:#007cba}
            input:checked+.rzfm-slider:before{transform:translateX(26px)}
        </style>
        <?php
    }

    /* --------------------------------------------------------------------- */
    /*  Settings save handler                                                */
    /* --------------------------------------------------------------------- */

    public function maybe_save_settings() {
        if (isset($_POST['rzfm_settings_nonce']) && wp_verify_nonce($_POST['rzfm_settings_nonce'], 'rzfm_save_settings')) {
            $new = array(
                'enable_file_manager' => isset($_POST['enable_file_manager']) ? 1 : 0,
                'enable_db_manager'   => isset($_POST['enable_db_manager']) ? 1 : 0,
            );
            update_option('rzfm_settings', $new);
            $this->settings = $new; // update cache
        }
    }
}
