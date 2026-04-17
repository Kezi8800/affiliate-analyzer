export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { url } = req.body || {};

  if (!url) {
    return res.status(200).json({
      success: false,
      error: "Missing URL"
    });
  }

  try {
    const u = new URL(url);
    const params = Object.fromEntries(u.searchParams.entries());
    const hostname = u.hostname.toLowerCase();

    const detected = [];

    // Amazon Attribution
    if (
      params.maas ||
      params.aa_campaignid ||
      params.aa_adgroupid ||
      params.aa_creativeid ||
      params.ref_ === "aa_maas"
    ) {
      detected.push("Amazon Attribution");
    }

    // Amazon Associates
    if (params.tag) {
      detected.push("Amazon Associates");
    }

    // Google Ads
    if (params.gclid || params.gbraid || params.wbraid || params.gad_campaignid) {
      detected.push("Google Ads");
    }

    // Meta Ads
    if (params.fbclid) {
      detected.push("Meta Ads");
    }

    // TikTok Ads
    if (params.ttclid) {
      detected.push("TikTok Ads");
    }

    // Microsoft Ads
    if (params.msclkid) {
      detected.push("Microsoft Ads");
    }

    // Impact
    if (params.irclickid || hostname.includes("impact.com")) {
      detected.push("Impact");
    }

    // Awin
    if (params.awc || hostname.includes("awin1.com")) {
      detected.push("Awin");
    }

    // CJ
    if (params.cjevent || hostname.includes("cj.com") || hostname.includes("anrdoezrs.net")) {
      detected.push("CJ Affiliate");
    }

    // ShareASale
    if (
      params.afftrack ||
      params.affiliateId ||
      hostname.includes("shareasale.com")
    ) {
      detected.push("ShareASale");
    }

    // Rakuten
    if (
      params.ranMID ||
      params.ranEAID ||
      params.ranSiteID ||
      hostname.includes("rakutenadvertising.com") ||
      hostname.includes("linksynergy.com")
    ) {
      detected.push("Rakuten");
    }

    // PartnerStack
    if (
      params.ps_xid ||
      params.ps_partner_key ||
      hostname.includes("partnerstack.com")
    ) {
      detected.push("PartnerStack");
    }

    // Tradedoubler
    if (
      params.tduid ||
      params.trafficsourceid ||
      hostname.includes("tradedoubler.com")
    ) {
      detected.push("Tradedoubler");
    }

    // Webgains
    if (
      params.wgcampaignid ||
      params.wgprogramid ||
      hostname.includes("webgains.com")
    ) {
      detected.push("Webgains");
    }

    // FlexOffers
    if (
      params.faid ||
      params.fobs ||
      hostname.includes("flexlinkspro.com") ||
      hostname.includes("flexoffers.com")
    ) {
      detected.push("FlexOffers");
    }

    // Partnerize / Pepperjam
    if (
      params.clickId ||
      params.pjID ||
      params.pjMID ||
      hostname.includes("partnerize.com") ||
      hostname.includes("pepperjamnetwork.com")
    ) {
      detected.push("Partnerize / Pepperjam");
    }

    // Skimlinks
    if (
      params.skimlinks ||
      params.utm_campaign === "skimlinks" ||
      hostname.includes("skimresources.com")
    ) {
      detected.push("Skimlinks");
    }

    // Sovrn / VigLink
    if (
      params.vglnk ||
      params.vgtid ||
      hostname.includes("viglink.com") ||
      hostname.includes("sovrn.com")
    ) {
      detected.push("Sovrn / VigLink");
    }

    // Admitad
    if (
      params.admitad_uid ||
      params.subid ||
      hostname.includes("admitad.com")
    ) {
      detected.push("Admitad");
    }

    // DCMnetwork
    if (params.dcm_click_id || hostname.includes("dcmnetwork.com")) {
      detected.push("DCMnetwork");
    }

    // Generic UTM
    if (
      params.utm_source ||
      params.utm_medium ||
      params.utm_campaign ||
      params.utm_term ||
      params.utm_content
    ) {
      detected.push("UTM Tracking");
    }

    // Generic affiliate/click tracking signals
    if (
      params.subid ||
      params.sub_id ||
      params.aff_id ||
      params.affiliate_id ||
      params.click_id
    ) {
      detected.push("Generic Affiliate Tracking");
    }

    const uniqueDetected = [...new Set(detected)];

    return res.status(200).json({
      success: true,
      hostname,
      detected: uniqueDetected,
      params
    });
  } catch (e) {
    return res.status(200).json({
      success: false,
      error: "Invalid URL"
    });
  }
}
