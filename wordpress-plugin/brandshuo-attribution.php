<?php
/**
 * Plugin Name: BrandShuo Attribution Checker
 * Plugin URI: https://brandshuo.com
 * Description: Embed the BrandShuo Attribution Intelligence tool on any page. Decode affiliate links to reveal network, publisher, risk, and incrementality. Use shortcode [brandshuo_attribution] or Gutenberg block.
 * Version: 4.7.0
 * Author: BrandShuo
 * Author URI: https://brandshuo.com
 * License: GPL-2.0+
 * Text Domain: brandshuo-attribution
 */

if (!defined('ABSPATH')) exit;

define('BSAC_VERSION', '4.7.0');
define('BSAC_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('BSAC_PLUGIN_URL', plugin_dir_url(__FILE__));

// ===== Settings =====
add_action('admin_menu', 'bsac_add_admin_menu');
add_action('admin_init', 'bsac_register_settings');

function bsac_add_admin_menu() {
    add_options_page(
        'BrandShuo Attribution Checker',
        'BrandShuo Attribution',
        'manage_options',
        'brandshuo-attribution',
        'bsac_settings_page'
    );
}

function bsac_register_settings() {
    register_setting('bsac_settings', 'bsac_api_url');
    register_setting('bsac_settings', 'bsac_api_key');
    register_setting('bsac_settings', 'bsac_default_mode');
    register_setting('bsac_settings', 'bsac_theme');

    add_option('bsac_api_url', 'https://tools.brandshuo.com/api/analyze');
    add_option('bsac_default_mode', 'single');
    add_option('bsac_theme', 'light');
}

function bsac_settings_page() {
    ?>
    <div class="wrap">
        <h1>🔗 BrandShuo Attribution Checker Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('bsac_settings'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="bsac_api_url">API URL</label></th>
                    <td>
                        <input type="url" id="bsac_api_url" name="bsac_api_url"
                               value="<?php echo esc_attr(get_option('bsac_api_url', 'https://tools.brandshuo.com/api/analyze')); ?>"
                               class="regular-text" />
                        <p class="description">Your BrandShuo Attribution Intelligence API endpoint.</p>
                    </td>
                </tr>
                <tr>
                    <th><label for="bsac_api_key">API Key</label></th>
                    <td>
                        <input type="password" id="bsac_api_key" name="bsac_api_key"
                               value="<?php echo esc_attr(get_option('bsac_api_key', '')); ?>"
                               class="regular-text" />
                        <p class="description">Get your free API key at <a href="https://brandshuo.com/api" target="_blank">brandshuo.com/api</a>. Leave empty for free tier (100 req/mo).</p>
                    </td>
                </tr>
                <tr>
                    <th><label for="bsac_default_mode">Default Mode</label></th>
                    <td>
                        <select id="bsac_default_mode" name="bsac_default_mode">
                            <option value="single" <?php selected(get_option('bsac_default_mode'), 'single'); ?>>Single URL</option>
                            <option value="batch" <?php selected(get_option('bsac_default_mode'), 'batch'); ?>>Batch (up to 50 URLs)</option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="bsac_theme">Theme</label></th>
                    <td>
                        <select id="bsac_theme" name="bsac_theme">
                            <option value="light" <?php selected(get_option('bsac_theme'), 'light'); ?>>Light</option>
                            <option value="dark" <?php selected(get_option('bsac_theme'), 'dark'); ?>>Dark</option>
                        </select>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

        <hr>
        <h2>Usage</h2>
        <p><strong>Shortcode:</strong> <code>[brandshuo_attribution]</code> — Embed the full checker on any page.</p>
        <p><strong>Shortcode with options:</strong> <code>[brandshuo_attribution mode="batch" placeholder="Paste URLs here..."]</code></p>
        <p><strong>PHP:</strong> <code>&lt;?php echo do_shortcode('[brandshuo_attribution]'); ?&gt;</code></p>
        <p><strong>Gutenberg:</strong> Search for "BrandShuo Attribution" in the block editor.</p>

        <hr>
        <p style="color:#64748b;font-size:13px">
            BrandShuo Attribution Intelligence v<?php echo BSAC_VERSION; ?> ·
            <a href="https://brandshuo.com/attribution-checker/" target="_blank">Web App</a> ·
            <a href="https://brandshuo.com/api" target="_blank">API Docs</a> ·
            <a href="mailto:hello@brandshuo.com">Support</a>
        </p>
    </div>
    <?php
}

// ===== Enqueue Assets =====
add_action('wp_enqueue_scripts', 'bsac_enqueue_assets');

function bsac_enqueue_assets() {
    wp_enqueue_style('bsac-styles', BSAC_PLUGIN_URL . 'assets/checker.css', [], BSAC_VERSION);
    wp_enqueue_script('bsac-script', BSAC_PLUGIN_URL . 'assets/checker.js', [], BSAC_VERSION, true);
    wp_localize_script('bsac-script', 'BSAC_Config', [
        'apiUrl' => get_option('bsac_api_url', 'https://tools.brandshuo.com/api/analyze'),
        'batchUrl' => str_replace('/analyze', '/batch', get_option('bsac_api_url', 'https://tools.brandshuo.com/api/analyze')),
        'feedbackUrl' => str_replace('/analyze', '/feedback', get_option('bsac_api_url', 'https://tools.brandshuo.com/api/analyze')),
        'apiKey' => get_option('bsac_api_key', ''),
        'defaultMode' => get_option('bsac_default_mode', 'single'),
        'theme' => get_option('bsac_theme', 'light'),
        'version' => BSAC_VERSION,
        'nonce' => wp_create_nonce('bsac_ajax')
    ]);
}

// ===== Shortcode =====
add_shortcode('brandshuo_attribution', 'bsac_shortcode');

function bsac_shortcode($atts) {
    $atts = shortcode_atts([
        'mode' => get_option('bsac_default_mode', 'single'),
        'placeholder' => 'Paste an affiliate, Amazon, ad, or publisher URL...',
    ], $atts, 'brandshuo_attribution');

    ob_start();
    include BSAC_PLUGIN_DIR . 'templates/checker.php';
    return ob_get_clean();
}

// ===== Gutenberg Block =====
add_action('init', 'bsac_register_block');

function bsac_register_block() {
    if (!function_exists('register_block_type')) return;

    wp_register_script(
        'bsac-block',
        BSAC_PLUGIN_URL . 'assets/block.js',
        ['wp-blocks', 'wp-element', 'wp-editor', 'wp-components'],
        BSAC_VERSION
    );

    register_block_type('brandshuo/attribution-checker', [
        'editor_script' => 'bsac-block',
        'render_callback' => 'bsac_shortcode',
        'attributes' => [
            'mode' => ['type' => 'string', 'default' => 'single'],
            'placeholder' => ['type' => 'string', 'default' => 'Paste URL...']
        ]
    ]);
}

// ===== Activation =====
register_activation_hook(__FILE__, 'bsac_activate');
function bsac_activate() {
    add_option('bsac_api_url', 'https://tools.brandshuo.com/api/analyze');
    add_option('bsac_default_mode', 'single');
    add_option('bsac_theme', 'light');
}

// ===== Deactivation =====
register_deactivation_hook(__FILE__, 'bsac_deactivate');
function bsac_deactivate() {
    // Clean up if needed
}
