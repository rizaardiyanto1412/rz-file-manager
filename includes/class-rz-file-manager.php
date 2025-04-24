<?php
/**
 * Main plugin class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Main plugin class.
 *
 * This class is responsible for initializing the plugin and setting up all the components.
 */
class RZ_File_Manager {

    /**
     * Instance of this class.
     *
     * @var RZ_File_Manager
     */
    private static $instance;

    /**
     * Constructor.
     */
    public function __construct() {
        // This constructor is intentionally left empty.
        // Initialization happens in the init() method.
    }

    /**
     * Initialize the plugin.
     *
     * @return void
     */
    public function init() {
        // Load required files
        $this->load_dependencies();

        // Register hooks
        $this->register_hooks();
    }

    /**
     * Load required dependencies.
     *
     * @return void
     */
    private function load_dependencies() {
        // Load admin class
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/class-admin.php';

        // Load filesystem class (Needs to be before REST API)
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/class-filesystem.php';

        // Load REST API loader class (Depends on Filesystem)
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/rest-api/class-rest-api-loader.php';

        // Load assets class
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/class-assets.php';

        // Load plugin links class
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/class-plugin-links.php';

        // Load settings class
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/class-settings.php';
    }

    /**
     * Register hooks.
     *
     * @return void
     */
    private function register_hooks() {
        // Initialize admin
        $admin = new RZ_File_Manager_Admin();

        // Initialize settings
        $settings = new RZ_File_DB_Manager_Settings();

        // Initialize REST API loader
        $rest_api_loader = new RZ_File_Manager_REST_API_Loader();

        // Initialize assets
        $assets = new RZ_File_Manager_Assets();

        // Initialize plugin links
        $plugin_links = new RZ_File_Manager_Plugin_Links();

        // Adminer rewrite rules and handling
        add_action('init', array($this, 'add_rewrite_rules'));
        add_filter('query_vars', array($this, 'add_query_vars'));
        add_action('template_redirect', array($this, 'handle_adminer_request'));
    }

    /**
     * Add rewrite rule for Adminer.
     *
     * @return void
     */
    public function add_rewrite_rules() {
        add_rewrite_rule('^rz-adminer/?$', 'index.php?rz_adminer_load=1', 'top');
    }

    /**
     * Add custom query variable for Adminer.
     *
     * @param array $vars Existing query variables.
     * @return array Updated query variables.
     */
    public function add_query_vars($vars) {
        $vars[] = 'rz_adminer_load';
        return $vars;
    }

    /**
     * Handle the request for the Adminer page.
     * Loads the Adminer auto-login script if the query var is set.
     *
     * @return void
     */
    public function handle_adminer_request() {
        if (get_query_var('rz_adminer_load')) {
            // Security check ALWAYS needed
            if (!current_user_can('manage_options')) {
                wp_die(__('Unauthorized', 'rz-file-manager'));
            }

            $adminer_vendor_path = RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/vendor/adminer.php';
            $adminer_auto_login_path = RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/adminer-auto-login.php'; // Needed for the initial auto-login POST setup

            if (!file_exists($adminer_vendor_path)) {
                 wp_die('Adminer script not found at: ' . esc_html($adminer_vendor_path));
            }

            // Check if Adminer seems to be running already by detecting its typical GET parameters.
            // Add more parameters here if needed based on Adminer's behavior.
            $isAdminerActive = isset($_GET['server']) || isset($_GET['username']) || isset($_GET['db']) || isset($_GET['sql']) || isset($_GET['edit']) || isset($_GET['select']) || isset($_GET['history']) || isset($_GET['dump']);

            if ($isAdminerActive) {
                // Adminer is already active (likely after the initial POST/Redirect/Get).
                // Just include the main Adminer script directly. It will handle its state.
                include $adminer_vendor_path;
                exit; // Stop WordPress further loading
            } else {
                // This appears to be the INITIAL request to /rz-adminer (no Adminer GET params).
                // Include the auto-login script which sets $_POST and then includes vendor/adminer.php.
                if (file_exists($adminer_auto_login_path)) {
                     include $adminer_auto_login_path; // This script includes vendor/adminer.php and exits itself
                     exit; // Exit again just to be safe
                } else {
                     wp_die('Adminer auto-login script not found at: ' . esc_html($adminer_auto_login_path));
                }
            }
        }
    }

    /**
     * Plugin activation.
     *
     * @return void
     */
    public static function activate() {
        // Create necessary directories if they don't exist
        if (!file_exists(RZ_FILE_MANAGER_PLUGIN_DIR . 'assets/js')) {
            wp_mkdir_p(RZ_FILE_MANAGER_PLUGIN_DIR . 'assets/js');
        }

        if (!file_exists(RZ_FILE_MANAGER_PLUGIN_DIR . 'assets/css')) {
            wp_mkdir_p(RZ_FILE_MANAGER_PLUGIN_DIR . 'assets/css');
        }

        // Add default plugin options
        $default_options = array(
            'root_path' => wp_upload_dir()['basedir'],
            'allowed_roles' => array('administrator'),
            'max_upload_size' => wp_max_upload_size(),
            'allowed_file_types' => 'jpg,jpeg,png,gif,pdf,doc,docx,ppt,pptx,xls,xlsx,zip,txt,md',
        );

        add_option('rz_file_manager_options', $default_options);

        // Flush rewrite rules on activation.
        self::add_rewrite_rules(); // Need to ensure our rule is added before flushing
        flush_rewrite_rules();
    }

    /**
     * Plugin deactivation.
     *
     * @return void
     */
    public static function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
}
