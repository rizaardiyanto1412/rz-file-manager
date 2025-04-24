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
        $settings = new RZ_File_DB_Manager_Settings();
        // Show main menu if any module enabled
        if ( $settings->is_file_manager_enabled() || $settings->is_db_manager_enabled() ) {
            add_menu_page(
                __('RZ File & DB Manager', 'rz-file-manager'),
                __('RZ File Manager', 'rz-file-manager'),
                'manage_options',
                'rz-file-manager',
                array(
                    $this,
                    $settings->is_file_manager_enabled() ? 'render_file_manager_page' : 'render_db_manager_page'
                ),
                'dashicons-portfolio',
                30
            );
            // File Manager submenu
            if ( $settings->is_file_manager_enabled() ) {
                add_submenu_page(
                    'rz-file-manager',
                    __('File Manager', 'rz-file-manager'),
                    __('File Manager', 'rz-file-manager'),
                    'manage_options',
                    'rz-file-manager',
                    array($this, 'render_file_manager_page')
                );
            }
            // DB Manager submenu
            if ( $settings->is_db_manager_enabled() ) {
                add_submenu_page(
                    'rz-file-manager',
                    __('DB Manager', 'rz-file-manager'),
                    __('DB Manager', 'rz-file-manager'),
                    'manage_options',
                    'rz-database-manager',
                    array($this, 'render_db_manager_page')
                );
            }
        }
        // Settings submenu
        add_submenu_page(
            'rz-file-manager',
            __('Settings', 'rz-file-manager'),
            __('Settings', 'rz-file-manager'),
            'manage_options',
            'rz-manager-settings',
            array($this, 'render_settings_page')
        );
    }

    /**
     * Render file manager page.
     *
     * @return void
     */
    public function render_file_manager_page() {
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

    /**
     * Render DB manager page.
     *
     * @return void
     */
    public function render_db_manager_page() {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'rz-file-manager'));
        }
        // Launch Adminer via auto-login wrapper (POST form)
        $adminer_url = esc_url( RZ_FILE_MANAGER_PLUGIN_URL . 'includes/adminer-auto-login.php' );
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('DB Manager', 'rz-file-manager'); ?></h1>
            <a href="<?php echo $adminer_url; ?>" target="_blank" rel="noopener noreferrer" class="button button-primary"><?php esc_html_e('Launch Adminer', 'rz-file-manager'); ?></a>
        </div>
        <?php
    }

    /**
     * Render settings page.
     *
     * @return void
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            wp_die(esc_html__('You do not have sufficient permissions to access this page.', 'rz-file-manager'));
        }
        $settings = new RZ_File_DB_Manager_Settings();
        $current = $settings->get_settings();
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Settings', 'rz-file-manager'); ?></h1>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <?php wp_nonce_field('rz_manager_settings_save'); ?>
                <input type="hidden" name="action" value="rz_save_settings">
                <table class="form-table">
                    <tr valign="top">
                        <th scope="row"><?php esc_html_e('File Manager', 'rz-file-manager'); ?></th>
                        <td><input type="checkbox" name="settings[file_manager_enabled]" value="1" <?php checked( $current['file_manager_enabled'], true ); ?> /> <label><?php esc_html_e('Enable File Manager module', 'rz-file-manager'); ?></label></td>
                    </tr>
                    <tr valign="top">
                        <th scope="row"><?php esc_html_e('DB Manager', 'rz-file-manager'); ?></th>
                        <td><input type="checkbox" name="settings[db_manager_enabled]" value="1" <?php checked( $current['db_manager_enabled'], true ); ?> /> <label><?php esc_html_e('Enable DB Manager module', 'rz-file-manager'); ?></label></td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}
