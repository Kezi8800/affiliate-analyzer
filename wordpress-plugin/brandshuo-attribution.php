<?php
/**
 * Plugin Name: BrandShuo Attribution Checker
 * Plugin URI: https://brandshuo.com
 * Description: Professional affiliate link analysis tool. Identify network, publisher, risk level, and incrementality. 25+ networks · 605 publishers · 52 regions.
 * Version: 5.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Author: BrandShuo
 * Author URI: https://brandshuo.com
 * License: GPL-2.0+
 * Text Domain: brandshuo-attribution
 */

if (!defined('ABSPATH')) exit;
define('BSAC_VERSION', '5.0.0');
define('BSAC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BSAC_PLUGIN_URL', plugin_dir_url(__FILE__));

add_action('admin_menu', function() {
    add_options_page('BrandShuo Attribution', 'BrandShuo Attribution', 'manage_options', 'brandshuo-attribution', 'bsac_settings_page');
});
add_action('admin_init', function() {
    register_setting('bsac_settings', 'bsac_api_key');
    register_setting('bsac_settings', 'bsac_default_tab');
    add_option('bsac_default_tab', 'single');
});
add_filter('plugin_action_links_' . plugin_basename(__FILE__), function($links) {
    $links[] = '<a href="' . admin_url('options-general.php?page=brandshuo-attribution') . '">Settings</a>';
    return $links;
});

function bsac_settings_page() { ?>
<div class="wrap" style="max-width:700px">
<div style="display:flex;align-items:center;gap:14px;margin:20px 0 10px">
<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect width="40" height="40" rx="10" fill="url(#g)"/><text x="20" y="27" text-anchor="middle" fill="white" font-size="18" font-weight="900" font-family="sans-serif">BS</text><defs><linearGradient id="g" x1="0" y1="0" x2="40" y2="40"><stop offset="0" stop-color="#2563eb"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs></svg>
<div><h1 style="font-size:22px;margin:0">BrandShuo Attribution Checker</h1><p style="color:#64748b;margin:2px 0 0;font-size:13px">v<?php echo BSAC_VERSION; ?> · 605 publishers · 25+ networks · 52 regions</p></div></div>
<form method="post" action="options.php" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-top:16px">
<?php settings_fields('bsac_settings'); ?>
<table class="form-table">
<tr><th><label>API Key</label></th><td><input type="password" name="bsac_api_key" value="<?php echo esc_attr(get_option('bsac_api_key','')); ?>" class="regular-text"><p class="description">Optional. Get a free key at <a href="https://brandshuo.com/api" target="_blank">brandshuo.com/api</a></p></td></tr>
<tr><th><label>Default Tab</label></th><td><select name="bsac_default_tab"><option value="single" <?php selected(get_option('bsac_default_tab'),'single'); ?>>Single URL</option><option value="batch" <?php selected(get_option('bsac_default_tab'),'batch'); ?>>Batch Analysis</option></select></td></tr>
</table>
<?php submit_button('Save Settings'); ?></form>
<div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:24px;margin-top:16px">
<h2 style="margin-top:0">Usage</h2>
<p><strong>Shortcode:</strong> <code>[brandshuo_attribution]</code></p>
<p><strong>Batch mode:</strong> <code>[brandshuo_attribution tab="batch"]</code></p>
<p><strong>PHP:</strong> <code>&lt;?php echo do_shortcode('[brandshuo_attribution]'); ?&gt;</code></p>
<p><strong>Gutenberg:</strong> Search "BrandShuo" in the block inserter.</p>
</div></div>
<?php }

add_shortcode('brandshuo_attribution', function($atts) {
    $atts = shortcode_atts(['tab' => get_option('bsac_default_tab','single')], $atts, 'brandshuo_attribution');
    wp_enqueue_style('bsac-font', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap', [], null);
    $config = json_encode(['defaultTab' => $atts['tab'], 'version' => BSAC_VERSION]);
    echo "<script>window.BSAC_Config = {$config};</script>";
    include BSAC_PLUGIN_DIR . 'templates/checker.php';
});

add_action('init', function() {
    if (!function_exists('register_block_type')) return;
    wp_register_script('bsac-block', BSAC_PLUGIN_URL . 'assets/block.js', ['wp-blocks','wp-element','wp-components'], BSAC_VERSION, true);
    register_block_type('brandshuo/attribution-checker', ['editor_script' => 'bsac-block', 'render_callback' => function($atts) { return do_shortcode('[brandshuo_attribution]'); }]);
});

register_activation_hook(__FILE__, function() { add_option('bsac_default_tab','single'); });
register_deactivation_hook(__FILE__, function() {});
