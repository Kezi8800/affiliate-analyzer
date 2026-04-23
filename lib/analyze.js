function renderPublisher(data) {
  const p = data.publisher_intelligence || {};

  function hasRealValue(v) {
    return v && v !== "Unknown" && v !== "—" && String(v).trim() !== "";
  }

  const evidence = p.evidence
    ? `${p.evidence.field || "unknown"} = ${p.evidence.value || ""}`
    : "No explicit match evidence captured.";

  const publisherGroupCard = hasRealValue(p.publisher_group)
    ? `
      <div class="bs-metric">
        <div class="bs-metric-label">Publisher Group</div>
        <div class="bs-metric-value">${escapeHtml(p.publisher_group)}</div>
      </div>
    `
    : "";

  return `
    <div class="bs-card bs-result-card">
      <div class="bs-result-head">Publisher Intelligence</div>

      <div class="bs-result-grid-3">
        <div class="bs-metric">
          <div class="bs-metric-label">Publisher</div>
          <div class="bs-metric-value">${escapeHtml(p.publisher || "Unknown")}</div>
        </div>

        ${publisherGroupCard}

        <div class="bs-metric">
          <div class="bs-metric-label">Type</div>
          <div class="bs-metric-value">${escapeHtml(p.type || "Unknown")}</div>
        </div>

        <div class="bs-metric">
          <div class="bs-metric-label">Media Group</div>
          <div class="bs-metric-value">${escapeHtml(p.media_group || "Unknown")}</div>
        </div>

        <div class="bs-metric">
          <div class="bs-metric-label">Subtype</div>
          <div class="bs-metric-value">${escapeHtml(p.subtype || "Unknown")}</div>
        </div>

        <div class="bs-metric">
          <div class="bs-metric-label">Matched By</div>
          <div class="bs-metric-value">${escapeHtml(p.matched_by || "Unknown")}</div>
        </div>
      </div>

      <div class="bs-metric" style="margin-top:12px;">
        <div class="bs-metric-label">Evidence</div>
        <div class="bs-metric-value">${escapeHtml(evidence)}</div>
      </div>
    </div>
  `;
}
