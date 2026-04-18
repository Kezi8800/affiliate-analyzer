<div id="affiliate-tool-wrap">
  <div class="aff-tool-card aff-tool-hero">
    <div class="aff-tool-header">
      <div class="aff-tool-logo">BS</div>
      <div>
        <div class="aff-tool-title-row">
          <h2>BrandShuo Attribution Checker</h2>
          <span class="aff-badge-version">v1.5</span>
        </div>
        <p class="aff-tool-subtitle">
          Analyze any affiliate or attribution link and instantly detect tracking layers, traffic sources, and hidden commission signals.
        </p>
      </div>
    </div>

    <div class="aff-input-row">
      <input id="aff-input-url" type="text" placeholder="Paste your URL here..." />
      <button id="aff-detect-btn" onclick="detectAffiliateLink()">⚡ Detect</button>
      <button id="aff-clear-btn" onclick="clearAffiliateTool()">Clear</button>
    </div>

    <div class="aff-quick-tags">
      <span>Quick hints:</span>
      <span class="quick-pill">Amazon Attribution</span>
      <span class="quick-pill">Amazon Associates</span>
      <span class="quick-pill">Amazon Creator Connections</span>
      <span class="quick-pill">Impact</span>
      <span class="quick-pill">CJ</span>
      <span class="quick-pill">Awin / ShareASale</span>
      <span class="quick-pill">Rakuten</span>
      <span class="quick-pill">Partnerize</span>
      <span class="quick-pill">Levanta</span>
      <span class="quick-pill">Archer Affiliates</span>
      <span class="quick-pill">Booking</span>
      <span class="quick-pill">ClickBank</span>
      <span class="quick-pill">Rewardful</span>
      <span class="quick-pill">LTK</span>
      <span class="quick-pill">ShopMy</span>
      <span class="quick-pill">TikTok Affiliate</span>
      <span class="quick-pill">Shopify Collabs</span>
    </div>
  </div>

  <div id="aff-result-area" style="display:none;">
    <div class="aff-tool-card aff-result-card">
      <div class="aff-result-top">
        <div>
          <div class="aff-small-label">PLATFORM DETECTED</div>
          <h3 id="aff-platform-name">-</h3>
          <div id="aff-domain-name" class="aff-domain-name">-</div>
        </div>
        <div id="aff-match-badge" class="aff-match-badge">PATTERN MATCH</div>
      </div>

      <div class="aff-section-grid">
        <div class="aff-mini-box">
          <div class="aff-mini-title">Link Type</div>
          <div id="aff-link-type"></div>
        </div>

        <div class="aff-mini-box">
          <div class="aff-mini-title">Traffic Signal</div>
          <div id="aff-traffic-signal"></div>
        </div>

        <div class="aff-mini-box">
          <div class="aff-mini-title">Attribution Flow</div>
          <div id="aff-flow-text"></div>
        </div>

        <div class="aff-mini-box">
          <div class="aff-mini-title">Risk Alert</div>
          <div id="aff-risk-alert"></div>
        </div>
      </div>
    </div>

    <div class="aff-tool-card">
      <div class="aff-section-head">
        <h4>URL Parameters</h4>
        <button class="copy-btn" onclick="copyJsonResult()">Copy JSON</button>
      </div>

      <div class="aff-table-wrap">
        <table class="aff-table">
          <thead>
            <tr>
              <th>KEY</th>
              <th>VALUE</th>
              <th>LABEL</th>
              <th>DESCRIPTION</th>
            </tr>
          </thead>
          <tbody id="aff-param-body"></tbody>
        </table>
      </div>
    </div>
  </div>

  <div id="aff-message-box"></div>
</div>

<style>
  #affiliate-tool-wrap{
    max-width:1100px;
    margin:0 auto;
    font-family:Arial,Helvetica,sans-serif;
    color:#0f172a;
  }

  .aff-tool-card{
    background:#fff;
    border:1px solid #e5e7eb;
    border-radius:20px;
    box-shadow:0 10px 30px rgba(15,23,42,.08);
    padding:28px;
    margin-bottom:24px;
  }

  .aff-tool-header{
    display:flex;
    align-items:flex-start;
    gap:16px;
    margin-bottom:22px;
  }

  .aff-tool-logo{
    width:56px;
    height:56px;
    border-radius:16px;
    background:linear-gradient(135deg,#4f46e5,#6d28d9);
    color:#fff;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:22px;
    font-weight:800;
    flex-shrink:0;
  }

  .aff-tool-title-row{
    display:flex;
    align-items:center;
    gap:12px;
    flex-wrap:wrap;
  }

  .aff-tool-title-row h2{
    margin:0;
    font-size:34px;
    line-height:1.2;
  }

  .aff-badge-version{
    display:inline-block;
    padding:6px 12px;
    border-radius:999px;
    background:#eef2ff;
    color:#4338ca;
    font-size:14px;
    font-weight:700;
  }

  .aff-tool-subtitle{
    margin:8px 0 0;
    color:#64748b;
    font-size:18px;
    line-height:1.6;
  }

  .aff-input-row{
    display:flex;
    gap:12px;
    align-items:center;
    flex-wrap:wrap;
  }

  #aff-input-url{
    flex:1;
    min-width:260px;
    height:58px;
    border:1px solid #cbd5e1;
    border-radius:14px;
    padding:0 18px;
    font-size:18px;
    outline:none;
    box-sizing:border-box;
  }

  #aff-input-url:focus{
    border-color:#4f46e5;
    box-shadow:0 0 0 4px rgba(79,70,229,.12);
  }

  #aff-detect-btn,
  #aff-clear-btn,
  .copy-btn{
    border:none;
    border-radius:14px;
    padding:0 22px;
    height:58px;
    cursor:pointer;
    font-size:17px;
    font-weight:700;
    transition:all .2s ease;
  }

  #aff-detect-btn{
    background:linear-gradient(135deg,#4338ca,#6d28d9);
    color:#fff;
  }

  #aff-detect-btn:hover{
    transform:translateY(-1px);
    box-shadow:0 8px 20px rgba(79,70,229,.25);
  }

  #aff-clear-btn{
    background:#f8fafc;
    color:#334155;
    border:1px solid #cbd5e1;
  }

  #aff-clear-btn:hover{
    background:#f1f5f9;
  }

  .copy-btn{
    height:42px;
    padding:0 16px;
    background:#4338ca;
    color:#fff;
    font-size:14px;
    border-radius:12px;
  }

  .copy-btn:hover{
    opacity:.92;
  }

  .aff-quick-tags{
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    align-items:center;
    margin-top:18px;
    color:#64748b;
    font-size:14px;
  }

  .quick-pill{
    background:#f1f5f9;
    color:#334155;
    padding:8px 12px;
    border-radius:999px;
    font-weight:600;
  }

  .aff-result-top{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:20px;
    flex-wrap:wrap;
    margin-bottom:24px;
  }

  .aff-small-label{
    color:#94a3b8;
    letter-spacing:.08em;
    font-size:13px;
    font-weight:800;
    margin-bottom:8px;
  }

  #aff-platform-name{
    margin:0;
    font-size:40px;
    line-height:1.15;
    color:#1d4ed8;
  }

  .aff-domain-name{
    color:#94a3b8;
    font-size:20px;
    margin-top:8px;
    word-break:break-all;
  }

  .aff-match-badge{
    background:#dcfce7;
    color:#15803d;
    font-weight:800;
    padding:10px 14px;
    border-radius:10px;
    font-size:14px;
  }

  .aff-section-grid{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:16px;
  }

  .aff-mini-box{
    background:#f8fafc;
    border:1px solid #e2e8f0;
    border-radius:16px;
    padding:18px;
  }

  .aff-mini-title{
    font-size:13px;
    color:#64748b;
    font-weight:800;
    text-transform:uppercase;
    letter-spacing:.06em;
    margin-bottom:10px;
  }

  .aff-pill{
    display:inline-block;
    padding:7px 12px;
    border-radius:999px;
    font-size:13px;
    font-weight:800;
    margin:4px 8px 4px 0;
    line-height:1.4;
  }

  .pill-blue{background:#dbeafe;color:#1d4ed8;}
  .pill-purple{background:#ede9fe;color:#6d28d9;}
  .pill-green{background:#dcfce7;color:#15803d;}
  .pill-orange{background:#ffedd5;color:#c2410c;}
  .pill-red{background:#fee2e2;color:#b91c1c;}
  .pill-gray{background:#e2e8f0;color:#334155;}

  .aff-section-head{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:12px;
    flex-wrap:wrap;
    margin-bottom:18px;
  }

  .aff-section-head h4{
    margin:0;
    font-size:24px;
  }

  .aff-table-wrap{
    overflow-x:auto;
  }

  .aff-table{
    width:100%;
    border-collapse:collapse;
    min-width:860px;
  }

  .aff-table th,
  .aff-table td{
    border-bottom:1px solid #e5e7eb;
    padding:14px 12px;
    text-align:left;
    vertical-align:top;
    font-size:15px;
  }

  .aff-table th{
    background:#f8fafc;
    color:#475569;
    font-weight:800;
  }

  .key-badge{
    display:inline-block;
    padding:6px 10px;
    border-radius:10px;
    background:#eef2ff;
    color:#4338ca;
    font-weight:800;
    font-size:13px;
  }

  #aff-message-box{
    margin-top:16px;
    font-size:15px;
  }

  .msg-error{
    background:#fef2f2;
    color:#b91c1c;
    border:1px solid #fecaca;
    border-radius:14px;
    padding:14px 16px;
  }

  .msg-success{
    background:#eff6ff;
    color:#1d4ed8;
    border:1px solid #bfdbfe;
    border-radius:14px;
    padding:14px 16px;
  }

  @media (max-width: 767px){
    .aff-tool-title-row h2{font-size:28px;}
    #aff-platform-name{font-size:30px;}
    .aff-section-grid{grid-template-columns:1fr;}
    #aff-input-url{width:100%;}
    #aff-detect-btn,#aff-clear-btn{width:100%;}
    .aff-tool-card{padding:20px;}
  }
</style>

<script>
  let lastJsonResult = null;

  const PARAM_META = {
    campaignid: { label: "ACC", desc: "Amazon Creator Connections campaign ID", color: "pill-purple" },
    linkid: { label: "ACC", desc: "Amazon Creator Connections link ID", color: "pill-purple" },
    linkcode: { label: "ACC", desc: "Amazon Creator Connections link type", color: "pill-purple" },

    tag: { label: "AMAZON ASSOC", desc: "Amazon Associates affiliate tag", color: "pill-blue" },
    ascsubtag: { label: "AMAZON ASSOC", desc: "Amazon Associates subtag", color: "pill-blue" },

    maas: { label: "ATTRIBUTION", desc: "Amazon Attribution tracking parameter", color: "pill-purple" },
    ref_: { label: "ATTRIBUTION", desc: "Amazon attribution tracking marker", color: "pill-purple" },
    aa_campaignid: { label: "ATTRIBUTION", desc: "Amazon Attribution campaign identifier", color: "pill-purple" },
    aa_adgroupid: { label: "ATTRIBUTION", desc: "Amazon Attribution ad group identifier", color: "pill-purple" },
    aa_creativeid: { label: "ATTRIBUTION", desc: "Amazon Attribution creative identifier", color: "pill-purple" },

    gclid: { label: "GOOGLE ADS", desc: "Google Ads click ID", color: "pill-orange" },
    gbraid: { label: "GOOGLE ADS", desc: "Google Ads braided click ID", color: "pill-orange" },
    wbraid: { label: "GOOGLE ADS", desc: "Google Ads web-to-app click ID", color: "pill-orange" },
    gad_campaignid: { label: "GOOGLE ADS", desc: "Google Ads campaign identifier", color: "pill-orange" },

    fbclid: { label: "META ADS", desc: "Facebook / Meta click ID", color: "pill-orange" },
    ttclid: { label: "TIKTOK", desc: "TikTok click ID", color: "pill-orange" },
    msclkid: { label: "MICROSOFT ADS", desc: "Microsoft Ads click ID", color: "pill-orange" },

    irclickid: { label: "IMPACT", desc: "Impact click tracking ID", color: "pill-green" },
    irgwc: { label: "IMPACT", desc: "Impact gateway click parameter", color: "pill-green" },
    cidimp: { label: "IMPACT", desc: "Impact-style campaign token on advertiser landing page", color: "pill-green" },
    utm_account: { label: "IMPACT", desc: "Impact/account identifier often seen in advertiser landing links", color: "pill-green" },
    utm_sharedid: { label: "SHARED ID", desc: "Publisher/source shared identifier", color: "pill-green" },

    awc: { label: "AWIN", desc: "Awin click reference", color: "pill-green" },
    clickref: { label: "AWIN", desc: "Awin click reference / sub-tracking", color: "pill-green" },
    afftrack: { label: "SHAREASALE", desc: "ShareASale sub-tracking parameter", color: "pill-green" },

    cjevent: { label: "CJ", desc: "CJ Affiliate event/click ID", color: "pill-green" },

    ranmid: { label: "RAKUTEN", desc: "Rakuten merchant ID", color: "pill-green" },
    raneaid: { label: "RAKUTEN", desc: "Rakuten affiliate ID", color: "pill-green" },
    ransiteid: { label: "RAKUTEN", desc: "Rakuten site ID", color: "pill-green" },

    pjid: { label: "PARTNERIZE", desc: "Partnerize / Pepperjam publisher ID", color: "pill-green" },
    pjmid: { label: "PARTNERIZE", desc: "Partnerize / Pepperjam merchant ID", color: "pill-green" },

    lc_sid: { label: "LINKCONNECTOR", desc: "LinkConnector publisher/site ID", color: "pill-green" },
    lc_mid: { label: "LINKCONNECTOR", desc: "LinkConnector merchant ID", color: "pill-green" },
    lc_cid: { label: "LINKCONNECTOR", desc: "LinkConnector campaign ID", color: "pill-green" },
    atid: { label: "LINKCONNECTOR", desc: "LinkConnector affiliate tracking identifier", color: "pill-green" },

    wgcampaignid: { label: "WEBGAINS", desc: "Webgains campaign ID", color: "pill-green" },
    wgprogramid: { label: "WEBGAINS", desc: "Webgains program ID", color: "pill-green" },

    tduid: { label: "TRADEDOUBLER", desc: "TradeDoubler unique click/user identifier", color: "pill-green" },
    trafficsourceid: { label: "TRADEDOUBLER", desc: "TradeDoubler traffic source identifier", color: "pill-green" },

    tt: { label: "TRADETRACKER", desc: "TradeTracker tracking parameter", color: "pill-green" },
    ttid: { label: "TRADETRACKER", desc: "TradeTracker ID", color: "pill-green" },

    adtractionid: { label: "ADTRACTION", desc: "Adtraction identifier", color: "pill-green" },
    adt_id: { label: "ADTRACTION", desc: "Adtraction tracking identifier", color: "pill-green" },

    campid: { label: "EBAY EPN", desc: "eBay Partner Network campaign ID", color: "pill-green" },
    customid: { label: "EBAY EPN", desc: "eBay Partner Network custom ID", color: "pill-green" },
    mpre: { label: "EBAY EPN", desc: "eBay Partner Network destination URL parameter", color: "pill-green" },
    pub: { label: "EBAY EPN", desc: "eBay publisher identifier", color: "pill-green" },

    aid: { label: "BOOKING", desc: "Booking.com affiliate ID", color: "pill-green" },
    label: { label: "BOOKING", desc: "Booking.com link label / placement tracking", color: "pill-green" },

    aff: { label: "DIGISTORE24", desc: "Digistore24 affiliate ID", color: "pill-green" },

    tid: { label: "CLICKBANK", desc: "ClickBank tracking ID", color: "pill-green" },
    vtid: { label: "CLICKBANK", desc: "ClickBank vendor tracking ID", color: "pill-green" },

    referral: { label: "REWARDFUL", desc: "Rewardful referral token / UUID", color: "pill-green" },
    coupon: { label: "COUPON", desc: "Coupon or promo code parameter", color: "pill-gray" },
    discount: { label: "COUPON", desc: "Discount parameter", color: "pill-gray" },

    ps_xid: { label: "PARTNERSTACK", desc: "PartnerStack click or attribution ID", color: "pill-green" },
    ps_partner_key: { label: "PARTNERSTACK", desc: "PartnerStack partner key", color: "pill-green" },

    pb: { label: "PARTNERBOOST", desc: "PartnerBoost tracking parameter", color: "pill-green" },
    pb_id: { label: "PARTNERBOOST", desc: "PartnerBoost campaign ID", color: "pill-green" },
    pb_clickid: { label: "PARTNERBOOST", desc: "PartnerBoost click ID", color: "pill-green" },
    pb_source: { label: "PARTNERBOOST", desc: "PartnerBoost traffic source", color: "pill-green" },

    faid: { label: "FLEXOFFERS", desc: "FlexOffers affiliate identifier", color: "pill-green" },
    fobs: { label: "FLEXOFFERS", desc: "FlexOffers tracking token", color: "pill-green" },

    skimlinks: { label: "SKIMLINKS", desc: "Skimlinks tracking signal", color: "pill-green" },
    skm: { label: "SKIMLINKS", desc: "Skimlinks signal", color: "pill-green" },
    vglnk: { label: "SOVRN", desc: "Sovrn / VigLink tracking parameter", color: "pill-green" },
    vgtid: { label: "SOVRN", desc: "Sovrn / VigLink tracking ID", color: "pill-green" },

    levanta_campaign: { label: "LEVANTA", desc: "Levanta campaign or referral parameter", color: "pill-green" },
    levanta_creator: { label: "LEVANTA", desc: "Levanta creator identifier", color: "pill-green" },
    archer_campaign: { label: "ARCHER", desc: "Archer Affiliates campaign parameter", color: "pill-green" },
    archer_creator: { label: "ARCHER", desc: "Archer creator / affiliate identifier", color: "pill-green" },

    creator: { label: "CREATOR", desc: "Generic creator identifier", color: "pill-gray" },
    affiliate: { label: "AFFILIATE", desc: "Generic affiliate identifier", color: "pill-gray" },

    subid: { label: "SUB ID", desc: "Affiliate sub tracking ID", color: "pill-gray" },
    sub_id: { label: "SUB ID", desc: "Affiliate sub tracking ID", color: "pill-gray" },
    aff_id: { label: "AFF ID", desc: "Generic affiliate identifier", color: "pill-gray" },
    affiliate_id: { label: "AFF ID", desc: "Generic affiliate identifier", color: "pill-gray" },
    click_id: { label: "CLICK ID", desc: "Generic click tracking parameter", color: "pill-gray" },
    clickid: { label: "CLICK ID", desc: "Generic click tracking parameter", color: "pill-gray" },

    utm_source: { label: "UTM", desc: "Traffic source parameter", color: "pill-gray" },
    utm_medium: { label: "UTM", desc: "Traffic medium parameter", color: "pill-gray" },
    utm_campaign: { label: "UTM", desc: "Campaign name parameter", color: "pill-gray" },
    utm_term: { label: "UTM", desc: "Paid keyword parameter", color: "pill-gray" },
    utm_content: { label: "UTM", desc: "Ad/content variation parameter", color: "pill-gray" }
  };

  const PLATFORM_DOMAIN_RULES = [
    { name: "Impact", hosts: ["impact.com", "impactradius.com"] },
    { name: "CJ Affiliate", hosts: ["anrdoezrs.net", "jdoqocy.com", "kqzyfj.com", "dpbolvw.net", "tkqlhce.com", "emjcd.com", "cj.com"] },
    { name: "Awin", hosts: ["awin1.com", "awin.com"] },
    { name: "ShareASale", hosts: ["shareasale.com"] },
    { name: "Rakuten Advertising", hosts: ["click.linksynergy.com", "linksynergy.com"] },
    { name: "Partnerize / Pepperjam", hosts: ["partnerize.com", "pepperjamnetwork.com", "pntra.com"] },
    { name: "Levanta", hosts: ["levanta.io"] },
    { name: "Archer Affiliates", hosts: ["archeraffiliates.com"] },
    { name: "LinkConnector", hosts: ["linkconnector.com"] },
    { name: "Webgains", hosts: ["webgains.com", "track.webgains.com"] },
    { name: "TradeDoubler", hosts: ["tradedoubler.com", "clk.tradedoubler.com"] },
    { name: "Adtraction", hosts: ["adtraction.com", "adtr.co"] },
    { name: "TradeTracker", hosts: ["tradetracker.net", "tc.tradetracker.net"] },
    { name: "Amazon Associates", hosts: ["amazon.com", "amzn.to", "amazon.ca", "amazon.co.uk", "amazon.de", "amazon.fr", "amazon.it", "amazon.es", "amazon.co.jp"] },
    { name: "eBay Partner Network", hosts: ["rover.ebay.com", "ebay.com"] },
    { name: "Skimlinks", hosts: ["go.skimresources.com", "skimresources.com"] },
    { name: "Sovrn / VigLink", hosts: ["redirect.viglink.com", "viglink.com", "shop-links.co"] },
    { name: "FlexOffers", hosts: ["clk.omgt5.com", "flexlinkspro.com"] },
    { name: "AliExpress Portals", hosts: ["s.click.aliexpress.com", "portals.aliexpress.com", "aliexpress.com"] },
    { name: "Booking.com Affiliate", hosts: ["booking.com", "sp.booking.com"] },
    { name: "Shopify Affiliate", hosts: ["shopify.com", "partners.shopify.com"] },
    { name: "PartnerStack", hosts: ["partnerstack.com"] },
    { name: "Avangate / 2Checkout", hosts: ["2checkout.com", "avangate.com"] },
    { name: "ClickBank", hosts: ["hop.clickbank.net", "clickbank.net", "clickbank.com"] },
    { name: "JVZoo", hosts: ["jvzoo.com", "jvz8.com"] },
    { name: "Digistore24", hosts: ["digistore24.com"] },
    { name: "Rewardful", hosts: ["rewardful.com"] },
    { name: "Amazon Creator Connections", hosts: ["amazon.com"] },
    { name: "TikTok Affiliate", hosts: ["tiktok.com", "vt.tiktok.com"] },
    { name: "Shopify Collabs", hosts: ["shopify.com", "shop.app"] },
    { name: "LTK", hosts: ["shopltk.com", "liketk.it", "ltk.app"] },
    { name: "ShopMy", hosts: ["shopmy.us"] },
    { name: "One Walmart Affiliates", hosts: ["walmart.com"] },
    { name: "Walmart Affiliates", hosts: ["walmart.com"] }
  ];

  const UTM_NETWORK_MAP = {
    impact: "Impact",
    impactradius: "Impact",
    impact_radius: "Impact",
    ignite: "Impact",

    cj: "CJ Affiliate",
    cjaffiliate: "CJ Affiliate",
    commissionjunction: "CJ Affiliate",

    awin: "Awin",
    shareasale: "ShareASale",
    sas: "ShareASale",

    rakuten: "Rakuten Advertising",
    linkshare: "Rakuten Advertising",
    linksynergy: "Rakuten Advertising",

    partnerize: "Partnerize / Pepperjam",
    pepperjam: "Partnerize / Pepperjam",
    pntra: "Partnerize / Pepperjam",

    levanta: "Levanta",
    archer: "Archer Affiliates",

    webgains: "Webgains",
    tradedoubler: "TradeDoubler",
    tradedbl: "TradeDoubler",
    tradetracker: "TradeTracker",
    adtraction: "Adtraction",
    linkconnector: "LinkConnector",

    skimlinks: "Skimlinks",
    skimbit: "Skimlinks",
    sovrn: "Sovrn / VigLink",
    viglink: "Sovrn / VigLink",

    flexoffers: "FlexOffers",
    partnerstack: "PartnerStack",
    partnerboost: "PartnerBoost",

    clickbank: "ClickBank",
    digistore24: "Digistore24",
    rewardful: "Rewardful",

    ltk: "LTK",
    shopltk: "LTK",
    liketoknowit: "LTK",
    liketkit: "LTK",
    shopmy: "ShopMy",

    booking: "Booking.com Affiliate",
    aliexpress: "AliExpress Portals",
    tiktok: "TikTok Affiliate",
    collabs: "Shopify Collabs",
    shopify: "Shopify Affiliate"
  };

  function showMessage(message, type = "success") {
    const box = document.getElementById("aff-message-box");
    box.className = type === "error" ? "msg-error" : "msg-success";
    box.innerHTML = message;
  }

  function clearMessage() {
    const box = document.getElementById("aff-message-box");
    box.className = "";
    box.innerHTML = "";
  }

  function getUrlObject(input) {
    try {
      return new URL(input);
    } catch {
      return null;
    }
  }

  function getDomainFromUrl(input) {
    const u = getUrlObject(input);
    return u ? u.hostname : "-";
  }

  function buildPill(text, cls = "pill-gray") {
    return `<span class="aff-pill ${cls}">${text}</span>`;
  }

  function dedupe(arr) {
    return [...new Set(arr)];
  }

  function normalizeKeys(obj = {}) {
    const normalized = {};
    Object.keys(obj || {}).forEach(key => {
      normalized[String(key).toLowerCase()] = obj[key];
    });
    return normalized;
  }

  function extractParamsFromUrl(rawUrl) {
    const u = getUrlObject(rawUrl);
    if (!u) return {};
    const out = {};
    u.searchParams.forEach((value, key) => {
      out[String(key).toLowerCase()] = value;
    });
    return out;
  }

  function detectByDomain(urlObj, detected) {
    if (!urlObj) return detected;
    const host = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname.toLowerCase();
    const result = [...detected];

    PLATFORM_DOMAIN_RULES.forEach(rule => {
      if (rule.hosts.some(h => host.includes(h))) {
        if (!result.includes(rule.name)) result.push(rule.name);
      }
    });

    if (host.includes("amazon.") && pathname.includes("/gp/product/")) {
      if (!result.includes("Amazon Associates")) result.push("Amazon Associates");
    }

    if (host.includes("shopmy.us")) {
      if (!result.includes("ShopMy")) result.push("ShopMy");
    }

    if (host.includes("shopltk.com") || host.includes("liketk.it") || host.includes("ltk.app")) {
      if (!result.includes("LTK")) result.push("LTK");
    }

    if (host.includes("booking.com")) {
      if (!result.includes("Booking.com Affiliate")) result.push("Booking.com Affiliate");
    }

    if (host.includes("partners.shopify.com") || pathname.includes("/affiliate_tools/")) {
      if (!result.includes("Shopify Affiliate")) result.push("Shopify Affiliate");
    }

    if (host.includes("shop.app") || pathname.includes("/collabs")) {
      if (!result.includes("Shopify Collabs")) result.push("Shopify Collabs");
    }

    if (host.includes("tiktok.com") && (pathname.includes("/affiliate") || pathname.includes("/link"))) {
      if (!result.includes("TikTok Affiliate")) result.push("TikTok Affiliate");
    }

    return dedupe(result);
  }

  function detectNetworkFromText(text, push) {
    if (!text) return;
    const safeText = String(text).toLowerCase();

    Object.entries(UTM_NETWORK_MAP).forEach(([keyword, network]) => {
      if (safeText.includes(keyword)) {
        push(network);
      }
    });
  }

  function enrichDetectedFromParams(detected, params, urlObj) {
    const result = [...detected];
    const utmMedium = (params.utm_medium || "").toLowerCase();
    const utmSource = (params.utm_source || "").toLowerCase();
    const utmCampaign = (params.utm_campaign || "").toLowerCase();
    const utmContent = (params.utm_content || "").toLowerCase();
    const host = urlObj ? urlObj.hostname.toLowerCase() : "";

    const push = (name) => {
      if (!result.includes(name)) result.push(name);
    };

    if (params.campaignid || params.linkid || params.linkcode) push("Amazon Creator Connections");

    if (params.tag || params.ascsubtag) push("Amazon Associates");
    if (params.maas || params.aa_campaignid || params.aa_adgroupid || params.aa_creativeid || params.ref_) {
      push("Amazon Attribution");
    }

    if (
      params.irclickid ||
      params.irgwc ||
      params.cidimp ||
      utmCampaign.includes("impact") ||
      utmMedium.includes("impact")
    ) {
      push("Impact");
    }

    if (params.cjevent) push("CJ Affiliate");
    if (params.awc || params.clickref) push("Awin");
    if (params.afftrack) push("ShareASale");

    if (params.ranmid || params.raneaid || params.ransiteid) push("Rakuten Advertising");
    if (params.pjid || params.pjmid) push("Partnerize / Pepperjam");
    if (params.lc_sid || params.lc_mid || params.lc_cid || params.atid) push("LinkConnector");
    if (params.wgcampaignid || params.wgprogramid) push("Webgains");
    if (params.tduid || params.trafficsourceid) push("TradeDoubler");
    if (params.tt || params.ttid) push("TradeTracker");
    if (params.adtractionid || params.adt_id) push("Adtraction");

    if (params.campid || params.customid || params.mpre || params.pub) push("eBay Partner Network");

    if (params.aid || params.label) {
      if (urlObj && urlObj.hostname.toLowerCase().includes("booking.com")) push("Booking.com Affiliate");
    }

    if (params.aff && urlObj && urlObj.hostname.toLowerCase().includes("digistore24")) push("Digistore24");
    if (params.tid || params.vtid) push("ClickBank");
    if (params.referral) push("Rewardful");

    if (params.ps_xid || params.ps_partner_key) push("PartnerStack");

    if (params.pb || params.pb_id || params.pb_clickid || params.pb_source) push("PartnerBoost");
    if (params.faid || params.fobs) push("FlexOffers");

    if (params.skimlinks || params.skm || utmSource.includes("skimbit") || utmSource.includes("skimlinks")) {
      push("Skimlinks");
    }

    if (params.vglnk || params.vgtid) push("Sovrn / VigLink");

    if (params.gclid || params.gbraid || params.wbraid || params.gad_campaignid) push("Google Ads");
    if (params.fbclid) push("Meta Ads");
    if (params.ttclid) push("TikTok");
    if (params.msclkid) push("Microsoft Ads");

    detectNetworkFromText(utmMedium, push);
    detectNetworkFromText(utmCampaign, push);
    detectNetworkFromText(utmSource, push);
    detectNetworkFromText(utmContent, push);

    if (
      host.includes("levanta.io") ||
      params.levanta_campaign ||
      params.levanta_creator ||
      (host.includes("levanta") && (
        params.referral ||
        params.creator ||
        params.affiliate ||
        utmSource.includes("levanta") ||
        utmCampaign.includes("levanta")
      ))
    ) {
      push("Levanta");
    }

    if (
      host.includes("archeraffiliates.com") ||
      params.archer_campaign ||
      params.archer_creator ||
      (host.includes("archer") && (
        params.referral ||
        params.creator ||
        params.affiliate ||
        utmSource.includes("archer") ||
        utmCampaign.includes("archer")
      ))
    ) {
      push("Archer Affiliates");
    }

    if (
      params.subid || params.sub_id || params.aff_id || params.affiliate_id ||
      params.click_id || params.clickid || utmMedium.includes("aff") || utmMedium.includes("affiliate")
    ) {
      push("Generic Affiliate Tracking");
    }

    if (params.utm_source || params.utm_medium || params.utm_campaign || params.utm_term || params.utm_content) {
      push("UTM Tracking");
    }

    return dedupe(result);
  }

  function inferFlow(params, detected) {
    const flow = [];

    if (params.gclid || params.gbraid || params.wbraid || params.gad_campaignid) flow.push("Google Ads");
    if (params.fbclid) flow.push("Meta Ads");
    if (params.ttclid) flow.push("TikTok Ads");
    if (params.msclkid) flow.push("Microsoft Ads");

    [
      "Impact",
      "CJ Affiliate",
      "Awin",
      "ShareASale",
      "Rakuten Advertising",
      "Partnerize / Pepperjam",
      "Levanta",
      "Archer Affiliates",
      "LinkConnector",
      "Webgains",
      "TradeDoubler",
      "Adtraction",
      "TradeTracker",
      "Amazon Attribution",
      "Amazon Associates",
      "Amazon Creator Connections",
      "eBay Partner Network",
      "Skimlinks",
      "Sovrn / VigLink",
      "FlexOffers",
      "PartnerStack",
      "PartnerBoost",
      "Booking.com Affiliate",
      "Shopify Affiliate",
      "ClickBank",
      "JVZoo",
      "Digistore24",
      "Rewardful",
      "TikTok Affiliate",
      "Shopify Collabs",
      "LTK",
      "ShopMy",
      "AliExpress Portals"
    ].forEach(name => {
      if (detected.includes(name)) flow.push(name);
    });

    flow.push("Destination URL");
    return dedupe(flow).join(" → ");
  }

  function inferRisks(detected, params) {
    const risks = [];
    const utmMedium = (params.utm_medium || "").toLowerCase();
    const utmCampaign = (params.utm_campaign || "").toLowerCase();

    if (detected.includes("Amazon Attribution") && detected.includes("Amazon Associates")) {
      risks.push("Possible duplicate attribution signal");
    }

    if ((params.gclid || params.gbraid || params.wbraid) && detected.includes("Amazon Attribution")) {
      risks.push("Paid traffic is being routed into attribution layer");
    }

    if (
      (
        params.irgwc ||
        params.irclickid ||
        params.cidimp ||
        utmMedium.includes("impact") ||
        utmCampaign.includes("impact")
      ) &&
      (params.utm_source || params.utm_medium || params.utm_campaign)
    ) {
      risks.push("Affiliate network + UTM layering detected");
    }

    if (detected.includes("Awin") && detected.includes("ShareASale")) {
      risks.push("Awin + ShareASale style markers both present");
    }

    if (Object.keys(params).length > 10) {
      risks.push("Link contains many tracking parameters");
    }

    if (!risks.length) {
      risks.push("No obvious structural risk detected");
    }

    return risks;
  }

  function renderDetectedPlatform(detected, params, urlObj) {
    const priority = [
      "Amazon Attribution",
      "Amazon Creator Connections",
      "Amazon Associates",
      "Impact",
      "CJ Affiliate",
      "Awin",
      "ShareASale",
      "Rakuten Advertising",
      "Partnerize / Pepperjam",
      "Levanta",
      "Archer Affiliates",
      "LinkConnector",
      "Webgains",
      "TradeDoubler",
      "Adtraction",
      "TradeTracker",
      "eBay Partner Network",
      "Booking.com Affiliate",
      "Skimlinks",
      "Sovrn / VigLink",
      "FlexOffers",
      "PartnerStack",
      "PartnerBoost",
      "AliExpress Portals",
      "Shopify Affiliate",
      "ClickBank",
      "JVZoo",
      "Digistore24",
      "Rewardful",
      "TikTok Affiliate",
      "Shopify Collabs",
      "LTK",
      "ShopMy"
    ];

    for (const name of priority) {
      if (detected.includes(name)) return name;
    }

    const utmMedium = (params.utm_medium || "").toLowerCase();
    const utmSource = (params.utm_source || "").toLowerCase();
    const utmCampaign = (params.utm_campaign || "").toLowerCase();

    if (
      params.irgwc ||
      params.irclickid ||
      params.cidimp ||
      utmCampaign.includes("impact") ||
      utmMedium.includes("impact")
    ) {
      return "Impact";
    }

    if (utmSource.includes("skimbit") || utmSource.includes("skimlinks")) {
      return "Skimlinks Publisher Link";
    }

    if (utmMedium.includes("aff") || utmMedium.includes("affiliate")) {
      return "Affiliate Tracking Link";
    }

    if (urlObj) {
      const host = urlObj.hostname.toLowerCase();
      if (host.includes("booking.com")) return "Booking.com Affiliate";
      if (host.includes("shopmy.us")) return "ShopMy";
      if (host.includes("shopltk.com") || host.includes("liketk.it") || host.includes("ltk.app")) return "LTK";
      if (host.includes("levanta.io")) return "Levanta";
      if (host.includes("archeraffiliates.com")) return "Archer Affiliates";
    }

    return "Unknown / Generic Tracking Link";
  }

  function renderLinkType(detected, params) {
    let html = "";

    const greenNetworks = [
      "Impact","CJ Affiliate","Awin","ShareASale","Rakuten Advertising","Partnerize / Pepperjam",
      "Levanta","Archer Affiliates","LinkConnector","Webgains","TradeDoubler","Adtraction","TradeTracker",
      "eBay Partner Network","Booking.com Affiliate","Skimlinks","Sovrn / VigLink","FlexOffers",
      "PartnerStack","PartnerBoost","AliExpress Portals","Shopify Affiliate","ClickBank","JVZoo",
      "Digistore24","Rewardful","TikTok Affiliate","Shopify Collabs","LTK","ShopMy"
    ];

    if (detected.includes("Amazon Attribution")) html += buildPill("Attribution", "pill-purple");
    if (detected.includes("Amazon Creator Connections")) html += buildPill("ACC", "pill-purple");
    if (detected.includes("Amazon Associates")) html += buildPill("Associates", "pill-blue");

    greenNetworks.forEach(name => {
      if (detected.includes(name)) {
        html += buildPill(name.replace(" / Pepperjam","").replace(" Advertising",""), "pill-green");
      }
    });

    if (params.gclid || params.gbraid || params.wbraid || params.gad_campaignid) html += buildPill("Paid Traffic", "pill-orange");
    if (params.fbclid) html += buildPill("Meta Traffic", "pill-orange");
    if (params.ttclid) html += buildPill("TikTok Traffic", "pill-orange");
    if (params.msclkid) html += buildPill("Microsoft Traffic", "pill-orange");
    if ((params.utm_medium || "").toLowerCase().includes("aff")) html += buildPill("Affiliate Traffic", "pill-green");

    if (!html) html = buildPill("Unclassified", "pill-gray");
    return html;
  }

  function renderTrafficSignal(params) {
    let html = "";

    Object.keys(params).forEach(key => {
      if (PARAM_META[key]) {
        html += buildPill(key, PARAM_META[key].color);
      }
    });

    if (!html) html = buildPill("No strong signal", "pill-gray");
    return html;
  }

  async function detectAffiliateLink() {
    clearMessage();

    const input = document.getElementById("aff-input-url");
    const url = input.value.trim();

    if (!url) {
      showMessage("Please enter a URL first.", "error");
      return;
    }

    document.getElementById("aff-detect-btn").innerText = "Detecting...";

    try {
      const urlObj = getUrlObject(url);
      if (!urlObj) {
        showMessage("Invalid URL. Please paste a full valid link.", "error");
        document.getElementById("aff-result-area").style.display = "none";
        return;
      }

      const localParams = extractParamsFromUrl(url);

      let apiDetected = [];
      let apiParams = {};
      let apiSuccess = false;

      try {
        const res = await fetch("https://tools.brandshuo.com/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url })
        });

        const data = await res.json();

        if (data && data.success) {
          apiSuccess = true;
          apiDetected = Array.isArray(data.detected) ? data.detected : [];
          apiParams = data.params || {};
        }
      } catch (e) {
      }

      const normalizedApiParams = normalizeKeys(apiParams);
      const params = { ...localParams, ...normalizedApiParams };

      let detected = enrichDetectedFromParams(apiDetected, params, urlObj);
      detected = detectByDomain(urlObj, detected);

      if (!Object.keys(params).length && !detected.length) {
        showMessage("No recognizable tracking parameters or affiliate platform patterns found.", "error");
        document.getElementById("aff-result-area").style.display = "none";
        return;
      }

      const domain = getDomainFromUrl(url);
      const platformName = renderDetectedPlatform(detected, params, urlObj);
      const risks = inferRisks(detected, params);

      document.getElementById("aff-platform-name").innerText = platformName;
      document.getElementById("aff-domain-name").innerText = domain;
      document.getElementById("aff-link-type").innerHTML = renderLinkType(detected, params);
      document.getElementById("aff-traffic-signal").innerHTML = renderTrafficSignal(params);
      document.getElementById("aff-flow-text").innerHTML = `<div style="font-weight:700;line-height:1.8">${inferFlow(params, detected)}</div>`;
      document.getElementById("aff-risk-alert").innerHTML = risks.map(r => {
        const cls = r.includes("No obvious") ? "pill-green" : "pill-red";
        return buildPill(r, cls);
      }).join("");

      const tbody = document.getElementById("aff-param-body");
      tbody.innerHTML = "";

      const keys = Object.keys(params);

      if (!keys.length) {
        tbody.innerHTML = `<tr><td colspan="4">No URL parameters found.</td></tr>`;
      } else {
        keys.forEach(key => {
          const meta = PARAM_META[key] || {
            label: "GENERAL",
            desc: "General query parameter",
            color: "pill-gray"
          };

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td><span class="key-badge">${key}</span></td>
            <td style="word-break:break-all;">${params[key]}</td>
            <td>${buildPill(meta.label, meta.color)}</td>
            <td>${meta.desc}</td>
          `;
          tbody.appendChild(tr);
        });
      }

      document.getElementById("aff-result-area").style.display = "block";

      lastJsonResult = {
        success: true,
        url,
        api_success: apiSuccess,
        detected,
        params,
        platform: platformName,
        risks
      };

      if (apiSuccess) {
        showMessage("Detection completed successfully.");
      } else {
        showMessage("Detection completed with local fallback rules.");
      }
    } catch (error) {
      showMessage("Request failed. Please check your API URL and try again.", "error");
      document.getElementById("aff-result-area").style.display = "none";
    } finally {
      document.getElementById("aff-detect-btn").innerText = "⚡ Detect";
    }
  }

  function clearAffiliateTool() {
    document.getElementById("aff-input-url").value = "";
    document.getElementById("aff-result-area").style.display = "none";
    document.getElementById("aff-param-body").innerHTML = "";
    document.getElementById("aff-platform-name").innerText = "-";
    document.getElementById("aff-domain-name").innerText = "-";
    document.getElementById("aff-link-type").innerHTML = "";
    document.getElementById("aff-traffic-signal").innerHTML = "";
    document.getElementById("aff-flow-text").innerHTML = "";
    document.getElementById("aff-risk-alert").innerHTML = "";
    lastJsonResult = null;
    clearMessage();
  }

  function copyJsonResult() {
    if (!lastJsonResult) {
      showMessage("No result to copy yet.", "error");
      return;
    }

    navigator.clipboard.writeText(JSON.stringify(lastJsonResult, null, 2))
      .then(() => showMessage("JSON copied to clipboard."))
      .catch(() => showMessage("Copy failed.", "error"));
  }
</script>
