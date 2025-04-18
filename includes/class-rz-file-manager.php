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
    }

    /**
     * Register hooks.
     *
     * @return void
     */
    private function register_hooks() {
        // Initialize admin
        $admin = new RZ_File_Manager_Admin();

        // Initialize REST API loader
        $rest_api_loader = new RZ_File_Manager_REST_API_Loader();

        // Initialize assets
        $assets = new RZ_File_Manager_Assets();

        // Initialize plugin links
        $plugin_links = new RZ_File_Manager_Plugin_Links();
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

        // Flush rewrite rules
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
