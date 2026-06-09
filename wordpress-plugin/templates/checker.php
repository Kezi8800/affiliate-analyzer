<?php
/**
 * Template: BrandShuo Attribution Checker Widget
 * Rendered via shortcode [brandshuo_attribution]
 */
$mode = $atts['mode'] ?? 'single';
$placeholder = $atts['placeholder'] ?? 'Paste an affiliate, Amazon, ad, or publisher URL...';
?>
<div id="bsac-wp-<?php echo uniqid(); ?>" class="bsac-wp-widget" data-mode="<?php echo esc_attr($mode); ?>" data-placeholder="<?php echo esc_attr($placeholder); ?>">
  <div class="bsac-wp-shell">
    <div class="bsac-wp-header">
      <div class="bsac-wp-brand">
        <span class="bsac-wp-logo">BS</span>
        <div>
          <div class="bsac-wp-eyebrow">Attribution Intelligence</div>
          <h2>BrandShuo Attribution Checker</h2>
        </div>
      </div>
    </div>

    <div class="bsac-wp-toggle">
      <button class="bsac-wp-mode-btn active" data-bsac-mode="single">Single URL</button>
      <button class="bsac-wp-mode-btn" data-bsac-mode="batch">Batch</button>
    </div>

    <div class="bsac-wp-input-area" data-bsac-single>
      <div class="bsac-wp-input-row">
        <input type="text" class="bsac-wp-url-input" placeholder="<?php echo esc_attr($placeholder); ?>" autocomplete="off">
        <button class="bsac-wp-analyze-btn">Analyze</button>
      </div>
    </div>

    <div class="bsac-wp-input-area bsac-wp-hidden" data-bsac-batch>
      <textarea class="bsac-wp-batch-input" placeholder="Paste multiple URLs, one per line..." rows="3"></textarea>
      <div class="bsac-wp-batch-footer">
        <button class="bsac-wp-batch-btn">Analyze All</button>
        <span class="bsac-wp-batch-count">0 URLs</span>
      </div>
    </div>

    <div class="bsac-wp-loading bsac-wp-hidden">Analyzing...</div>
    <div class="bsac-wp-error bsac-wp-hidden"></div>
    <div class="bsac-wp-result bsac-wp-hidden"></div>
  </div>
</div>
