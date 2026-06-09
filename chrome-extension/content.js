// content.js — BrandShuo Attribution Checker Content Script
// Scans the current page for affiliate links and marks them with a badge

(function () {
  "use strict";

  const AFFILIATE_PARAMS = [
    "tag=", "ascsubtag", "irclickid", "irgwc", "cjevent", "cjdata",
    "awc=", "awinaffid", "awinmid", "raneaid", "ranmid", "ransiteid",
    "clickref", "click_id", "sourceid=imp_", "sscid", "pb=", "pb_clickid",
    "levanta=", "rfsn=", "sca_ref", "gfp_ref", "sharedid", "subid1",
    "maas=", "aa_campaignid", "utm_source=partnerize",
    "utm_source=partnerboost", "utm_source=levanta"
  ];

  function isAffiliateLink(href) {
    if (!href) return false;
    const lower = href.toLowerCase();
    return AFFILIATE_PARAMS.some((p) => lower.includes(p));
  }

  function scanPage() {
    const links = document.querySelectorAll("a[href]");
    let count = 0;

    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (isAffiliateLink(href)) {
        count++;
        // Add a subtle badge indicator
        if (!link.querySelector(".bsac-badge")) {
          const badge = document.createElement("span");
          badge.className = "bsac-badge";
          badge.textContent = "🔗";
          badge.title = "Affiliate link detected — click to analyze with BrandShuo";
          badge.style.cssText = `
            display:inline-block;margin-left:3px;font-size:11px;
            cursor:pointer;opacity:0.7;transition:opacity 0.15s;
          `;
          badge.addEventListener("mouseenter", () => { badge.style.opacity = "1"; });
          badge.addEventListener("mouseleave", () => { badge.style.opacity = "0.7"; });
          badge.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            chrome.runtime.sendMessage({ type: "ANALYZE_URL", url: href });
          });
          link.appendChild(badge);
        }
      }
    });

    return count;
  }

  // Initial scan
  const found = scanPage();

  // Re-scan on DOM changes (debounced)
  let debounceTimer;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scanPage, 1000);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Notify background script of scan results
  if (found > 0) {
    chrome.runtime.sendMessage({
      type: "SCAN_RESULT",
      count: found,
      url: window.location.href
    });
  }
})();
