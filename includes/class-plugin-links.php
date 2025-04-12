<?php
/**
 * Plugin Links class.
 *
 * @package RZ_File_Manager
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Plugin Links class.
 *
 * This class handles the plugin action links in the plugins page.
 */
class RZ_File_Manager_Plugin_Links {

    /**
     * Constructor.
     */
    public function __construct() {
        // Add filter for plugin action links
        add_filter('plugin_action_links_' . RZ_FILE_MANAGER_PLUGIN_BASENAME, array($this, 'add_action_links'));
    }

    /**
     * Add action links to the plugin on the plugins page.
     *
     * @param array $links Default plugin action links.
     * @return array Modified plugin action links.
     */
    public function add_action_links($links) {
        // Add File Manager link
        $file_manager_link = sprintf(
            '<a href="%s">%s</a>',
            admin_url('admin.php?page=rz-file-manager'),
            __('File Manager', 'rz-file-manager')
        );

        // Add the link at the beginning of the array
        array_unshift($links, $file_manager_link);

        return $links;
    }
}
