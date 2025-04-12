<?php
/**
 * REST API Loader class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * REST API Loader class.
 *
 * This class loads all the REST API classes.
 */
class RZ_File_Manager_REST_API_Loader {

    /**
     * Array of REST API classes.
     *
     * @var array
     */
    private $api_classes = array();

    /**
     * Constructor.
     */
    public function __construct() {
        // Load required files
        $this->load_dependencies();
        
        // Initialize REST API classes
        $this->initialize_api_classes();
    }

    /**
     * Load required dependencies.
     *
     * @return void
     */
    private function load_dependencies() {
        // Load base class first
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/rest-api/class-rest-api-base.php';
        
        // Load specific API classes
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/rest-api/class-file-operations.php';
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/rest-api/class-content-operations.php';
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/rest-api/class-transfer-operations.php';
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/rest-api/class-archive-operations.php';
        require_once RZ_FILE_MANAGER_PLUGIN_DIR . 'includes/rest-api/class-copy-move-operations.php';
    }

    /**
     * Initialize REST API classes.
     *
     * @return void
     */
    private function initialize_api_classes() {
        // Initialize each API class
        $this->api_classes['file_operations'] = new RZ_File_Manager_REST_API_File_Operations();
        $this->api_classes['content_operations'] = new RZ_File_Manager_REST_API_Content_Operations();
        $this->api_classes['transfer_operations'] = new RZ_File_Manager_REST_API_Transfer_Operations();
        $this->api_classes['archive_operations'] = new RZ_File_Manager_REST_API_Archive_Operations();
        $this->api_classes['copy_move_operations'] = new RZ_File_Manager_REST_API_Copy_Move_Operations();
    }
}
