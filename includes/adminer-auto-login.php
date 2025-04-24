<?php
/**
 * Auto-login wrapper for Adminer using WordPress credentials.
 */

// Bootstrap WordPress
require_once dirname(__FILE__, 5) . '/wp-load.php';

// Restrict to administrators
if (!current_user_can('manage_options')) {
    wp_die(__('Unauthorized', 'rz-file-manager'));
}

// Database credentials
$server   = DB_HOST;
$username = DB_USER;
$password = DB_PASSWORD;
$database = DB_NAME;

// URL to Adminer script
$action = esc_url( RZ_FILE_MANAGER_PLUGIN_URL . 'includes/vendor/adminer.php' );
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title><?php esc_html_e('DB Manager - Adminer', 'rz-file-manager'); ?></title>
</head>
<body>
    <form id="adminer-login-form" method="post" action="<?php echo $action; ?>">
        <input type="hidden" name="auth[driver]" value="server">
        <input type="hidden" name="auth[server]" value="<?php echo esc_attr($server); ?>">
        <input type="hidden" name="auth[username]" value="<?php echo esc_attr($username); ?>">
        <input type="hidden" name="auth[password]" value="<?php echo esc_attr($password); ?>">
        <input type="hidden" name="auth[db]" value="<?php echo esc_attr($database); ?>">
    </form>
    <script>document.getElementById('adminer-login-form').submit();</script>
</body>
</html>
<?php exit;
