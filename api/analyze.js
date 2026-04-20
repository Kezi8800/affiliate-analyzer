(function(){
  const API_ENDPOINT = "/api/analyze";

  const els = {
    input: document.getElementById("bs-input-url"),
    detectBtn: document.getElementById("bs-detect-btn"),
    clearBtn: document.getElementById("bs-clear-btn"),
    status: document.getElementById("bs-status"),
    results: document.getElementById("bs-results"),
    platform: document.getElementById("bs-platform"),
    trafficType: document.getElementById("bs-traffic-type"),
    primaryClaimer: document.getElementById("bs-primary-claimer"),
    conflictLevel: document.getElementById("bs-conflict-level"),
    overviewConfidence: document.getElementById("bs-overview-confidence"),
    publisherName: document.getElementById("bs-publisher-name"),
    publisherSubsite: document.getElementById("bs-publisher-subsite"),
    publisherType: document.getElementById("bs-publisher-type"),
    publisherConfidence: document.getElementById("bs-publisher-confidence"),
    cePrimary: document.getElementById("bs-ce-primary"),
    ceSecondary: document.getElementById("bs-ce-secondary"),
    ceReason: document.getElementById("bs-ce-reason"),
    ceConfidence: document.getElementById("bs-ce-confidence"),
    trackingLayers: document.getElementById("bs-tracking-layers"),
    decisionBasis: document.getElementById("bs-decision-basis"),
    paramSignals: document.getElementById("bs-param-signals"),
    summary: document.getElementById("bs-summary"),
    rawJson: document.getElementById("bs-raw-json"),
    candidates: document.getElementById("bs-candidates")
  };

  function setStatus(msg, show = true){
    els.status.textContent = msg || "";
    els.status.classList.toggle("show", !!show);
  }

  function clearResults(){
    els.results.classList.remove("show");
    els.platform.textContent = "-";
    els.trafficType.textContent = "-";
    els.primaryClaimer.textContent = "-";
    els.conflictLevel.textContent = "-";
    els.overviewConfidence.textContent = "Confidence: -";
    els.publisherName.textContent = "-";
    els.publisherSubsite.textContent = "-";
    els.publisherType.textContent = "-";
    els.publisherConfidence.textContent = "-";
    els.cePrimary.textContent = "-";
    els.ceSecondary.textContent = "-";
    els.ceReason.textContent = "-";
    els.ceConfidence.textContent = "-";
    els.trackingLayers.innerHTML = "";
    els.decisionBasis.innerHTML = "";
    els.paramSignals.innerHTML = "";
    els.summary.textContent = "-";
    els.rawJson.textContent = "";
    els.candidates.innerHTML = "";
  }

  function escapeHtml(str){
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function pill(text, variant = "accent"){
    return '<span class="bs-pill pill-' + variant + '">' + escapeHtml(text) + '</span>';
  }

  function renderTrackingLayers(layers){
    if(!Array.isArray(layers) || !layers.length){
      els.trackingLayers.innerHTML = '<div class="bs-note">No major tracking layers detected.</div>';
      return;
    }
    els.trackingLayers.innerHTML = layers.map(layer => {
      let variant = "accent";
      if (/affiliate|associates|creator|network|publisher/i.test(layer)) variant = "ok";
      if (/ads|paid|criteo|triple whale|google|meta|tiktok|microsoft/i.test(layer)) variant = "warn";
      if (/conflict/i.test(layer)) variant = "danger";
      return pill(layer, variant);
    }).join("");
  }

  function renderDecisionBasis(items){
    if(!Array.isArray(items) || !items.length){
      els.decisionBasis.innerHTML = '<div class="bs-note">No decision notes available.</div>';
      return;
    }
    els.decisionBasis.innerHTML = items.map(item => `
      <div class="bs-row">
        <span class="label">Reason</span>
        <span class="value">${escapeHtml(item)}</span>
      </div>
    `).join("");
  }

  function renderParamSignals(signals){
    if(!signals || typeof signals !== "object" || !Object.keys(signals).length){
      els.paramSignals.innerHTML = '<div class="bs-note">No special parameters detected.</div>';
      return;
    }
    const html = Object.entries(signals).map(([k, v]) => `
      <div class="bs-row">
        <span class="label">${escapeHtml(k)}</span>
        <span class="value">${escapeHtml(typeof v === "object" ? JSON.stringify(v) : v)}</span>
      </div>
    `).join("");
    els.paramSignals.innerHTML = '<div class="bs-list">' + html + '</div>';
  }

  function renderCandidates(candidates){
    if(!Array.isArray(candidates) || !candidates.length){
      els.candidates.innerHTML = '<div class="bs-note">No candidate platforms detected.</div>';
      return;
    }
    els.candidates.innerHTML = candidates.map(item => `
      <div class="bs-row">
        <span class="label">${escapeHtml(item.name)} (${escapeHtml(item.confidence || "-")})</span>
        <span class="value">Score ${escapeHtml(item.score)} | ${escapeHtml((item.signals || []).join(", "))}</span>
      </div>
    `).join("");
  }

  function renderResult(data){
    els.results.classList.add("show");

    els.platform.textContent = data.primary_platform?.name || "-";
    els.trafficType.textContent = data.traffic_type || "-";
    els.primaryClaimer.textContent = data.commission_engine?.primary_claimer || "-";
    els.conflictLevel.textContent = data.commission_engine?.conflict_level || "-";
    els.overviewConfidence.textContent = "Confidence: " + (data.confidence || "-");

    els.publisherName.textContent = data.publisher?.publisher || "-";
    els.publisherSubsite.textContent = data.publisher?.sub_site || "-";
    els.publisherType.textContent = data.publisher?.type || "-";
    els.publisherConfidence.textContent = data.publisher?.confidence || "-";

    els.cePrimary.textContent = data.commission_engine?.primary_claimer || "-";
    els.ceSecondary.textContent = Array.isArray(data.commission_engine?.secondary_claimers)
      ? data.commission_engine.secondary_claimers.join(", ")
      : "-";
    els.ceReason.textContent = data.commission_engine?.reason || "-";
    els.ceConfidence.textContent = data.commission_engine?.confidence || "-";

    renderTrackingLayers(data.tracking_layers || []);
    renderDecisionBasis(data.commission_engine?.decision_basis || []);
    renderParamSignals(data.parameter_signals || {});
    renderCandidates(data.platform_candidates || []);

    els.summary.textContent = data.summary || "-";
    els.rawJson.textContent = JSON.stringify(data, null, 2);
  }

  async function detect(){
    const url = els.input.value.trim();
    if(!url){
      setStatus("Please paste a URL first.");
      return;
    }

    clearResults();
    setStatus("Analyzing weighted signals, platform candidates, and commission ownership...");

    try{
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      const text = await res.text();
      let data = null;

      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }

      if(!res.ok){
        throw new Error(
          (data && (data.detail || data.message || data.error)) ||
          ("Request failed with status " + res.status)
        );
      }

      setStatus("Detection complete.");
      renderResult(data);
    }catch(err){
      console.error("Detect failed:", err);
      setStatus("Error: " + (err.message || "Unknown error"));
    }
  }

  els.detectBtn.addEventListener("click", detect);

  els.clearBtn.addEventListener("click", function(){
    els.input.value = "";
    setStatus("", false);
    clearResults();
  });

  els.input.addEventListener("keydown", function(e){
    if(e.key === "Enter") detect();
  });

  const examples = {
    "amazon-attribution": "https://www.amazon.com/dp/B0XXXXX?maas=maas_adg_api_123&ref_=aa_maas&aa_campaignid=123&aa_adgroupid=456",
    "amazon-associates": "https://www.amazon.com/dp/B0XXXXX?tag=example-20",
    "amazon-creator": "https://www.amazon.com/gp/product/B0XXXXX?creative=9325&camp=1789&linkCode=ur2&tag=slickdeals09-20&ascsubtag=abcINT",
    "awin": "https://www.example.com/?click_id=1011lCm2LnUQ&utm_medium=affiliate&utm_source=futurepublishing",
    "impact": "https://www.example.com/?irclickid=abc123&utm_medium=affiliate",
    "cj": "https://www.example.com/?cjevent=abc123",
    "rakuten": "https://www.example.com/?ranMID=12345&ranEAID=abc&ranSiteID=xyz",
    "partnerboost": "https://www.example.com/?pb_id=123&pb_clickid=abc&pb_source=tiktok"
  };

  document.querySelectorAll("#bs-aff-tool .bs-hint").forEach(tag => {
    tag.addEventListener("click", function(){
      const key = this.getAttribute("data-example");
      if (examples[key]) {
        els.input.value = examples[key];
      }
    });
  });
})();
