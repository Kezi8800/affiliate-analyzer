=== BrandShuo Attribution Checker ===
Contributors: brandshuo
Tags: affiliate, attribution, link checker, amazon associates, affiliate marketing, cj affiliate, awin, impact, rakuten, publisher detection
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 7.4
Stable tag: 5.0.0
License: GPL-2.0+
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Professional affiliate link analysis tool. Instantly identify network, publisher, risk level, and incrementality. 25+ networks · 605 publishers · 52 regions.

== Description ==

BrandShuo Attribution Checker embeds a professional-grade affiliate link analysis tool directly on your WordPress site.

**What it detects:**

* **Network:** Amazon Associates, CJ Affiliate, Awin, Impact, Rakuten, ShareASale, PartnerBoost, Levanta, Partnerize, Google Ads, Meta Ads, TikTok Ads, and 15+ more
* **Publisher:** 605 known publishers across 52 regions — media sites, deal communities, review platforms, influencers
* **Risk Level:** Incrementality risk assessment (Low / Medium / High / Very High)
* **Quality Score:** 0-100 quality rating for each publisher
* **Signal Flags:** Affiliate tags, paid click IDs, sub IDs, editorial/deal type indicators

**Features:**

* Single URL and Batch Analysis modes
* Professional UI with animated gauge charts
* Copy & Share results
* Unknown publisher feedback submission
* CSV export for batch results
* Gutenberg block ready
* No external dependencies — works out of the box

**Networks detected:** Amazon Associates, Amazon Attribution, CJ Affiliate, Awin, Impact, Rakuten Advertising, ShareASale, Partnerize/Pepperjam, PartnerBoost, Levanta, Refersion, GoAffPro, UpPromote, Skimlinks, Sovrn Commerce, eBay Partner Network, Walmart/Impact, Google Ads, Meta Ads, TikTok Ads, Microsoft Ads, Pinterest Ads, Snapchat Ads, Twitter/X Ads, Reddit Ads, LinkedIn Ads, FlexOffers, Admitad, TradeDoubler, TradeTracker, Webgains, LinkConnector, Everflow, TUNE/HasOffers

== Installation ==

1. Upload the `brandshuo-attribution` folder to `/wp-content/plugins/` or install via WordPress plugin directory
2. Activate the plugin
3. Go to Settings → BrandShuo Attribution for options
4. Use the shortcode `[brandshuo_attribution]` on any page or post

== Usage ==

**Shortcode:**

`[brandshuo_attribution]` — Full checker with default settings

`[brandshuo_attribution tab="batch"]` — Start in batch analysis mode

**Gutenberg:** Search for "BrandShuo" in the block inserter.

**PHP:** `<?php echo do_shortcode('[brandshuo_attribution]'); ?>`

== Screenshots ==

1. Single URL analysis — detects network, publisher, quality score, risk
2. Batch analysis mode — analyze up to 50 URLs at once
3. Publisher details — identity, attribution layer, traffic signals
4. Gutenberg block — insert the checker anywhere

== Privacy ==

This plugin sends URLs you analyze to the BrandShuo Attribution Intelligence API at `tools.brandshuo.com`. No personal data is collected or stored by the plugin. Analysis history is stored only in your browser's localStorage.

== Changelog ==

= 5.0.0 =
* Premium v6 widget with gradient background, animated gauges, glass morphism
* Inter font from Google Fonts
* Professional UI redesign
* Improved mobile responsiveness
* Plugin settings page overhaul

= 4.7.0 =
* Batch analysis mode
* Feedback submission for unknown publishers
* CSV export
* Gutenberg block support
