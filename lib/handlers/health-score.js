// lib/handlers/health-score.js
// BrandShuo — Affiliate Program Health Scorer
// POST /api/health-score — analyze batch of links, score program health
const { analyzeLink } = require("../analyze");

function scoreRisk(risk){const r=String(risk||"").toLowerCase();if(r.includes("very high"))return 0;if(r.includes("high"))return 25;if(r.includes("medium"))return 50;if(r.includes("low"))return 80;return 50}
function scoreQuality(q){return Math.min(100,Math.max(0,Number(q||0)))}
function scoreCategory(cat){const c=String(cat||"").toLowerCase();if(c.includes("editorial")||c.includes("review")||c.includes("content"))return 85;if(c.includes("creator")||c.includes("influencer"))return 70;if(c.includes("deal")||c.includes("coupon"))return 45;if(c.includes("cashback")||c.includes("loyalty"))return 35;if(c.includes("extension"))return 15;return 50}

module.exports = async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS")return res.status(204).end();
  try{
    const {urls}=req.body||{};if(!urls||!Array.isArray(urls)||!urls.length)return res.status(400).json({ok:false,error:true,message:"Missing urls array"});
    const start=Date.now();const results=urls.slice(0,100).map(u=>{try{const a=analyzeLink(u);return{url:u,ok:true,network:a.network||"—",publisher:a.publisher||"—",publisher_type:a.publisher_type||"—",quality:a.quality_score||a.traffic_quality||0,risk:a.incrementality_risk||"—",channel_role:a.channel_role||"—"}}catch{return{url:u,ok:false,error:"failed"}}});
    const ok=results.filter(r=>r.ok);
    if(!ok.length)return res.status(200).json({ok:true,error:true,message:"No links could be analyzed"});

    // Health dimensions
    const avgQuality=Math.round(ok.reduce((s,r)=>s+scoreQuality(r.quality),0)/ok.length);
    const avgRisk=Math.round(ok.reduce((s,r)=>s+scoreRisk(r.risk),0)/ok.length);
    const avgCategory=Math.round(ok.reduce((s,r)=>s+scoreCategory(r.publisher_type),0)/ok.length);

    // Network diversity
    const networks={};ok.forEach(r=>{if(r.network&&r.network!=="Unknown")networks[r.network]=(networks[r.network]||0)+1});
    const netDiversity=Object.keys(networks).length;
    const netScore=netDiversity>=5?90:netDiversity>=3?70:netDiversity>=1?40:10;

    // Publisher type distribution
    const types={};ok.forEach(r=>{const t=r.publisher_type||"Unknown";types[t]=(types[t]||0)+1});
    const total=ok.length;
    const editorialPct=ok.filter(r=>(r.publisher_type||"").toLowerCase().includes("editorial")||(r.publisher_type||"").toLowerCase().includes("review")||(r.publisher_type||"").toLowerCase().includes("content")).length/total*100;
    const dealPct=ok.filter(r=>(r.publisher_type||"").toLowerCase().includes("deal")||(r.publisher_type||"").toLowerCase().includes("coupon")).length/total*100;
    const extensionPct=ok.filter(r=>(r.publisher_type||"").toLowerCase().includes("extension")).length/total*100;
    const unknownPct=ok.filter(r=>r.publisher==="Unknown Publisher"||(r.publisher||"").includes("Unknown")).length/total*100;

    // Overall health score (weighted)
    const healthScore=Math.round(avgQuality*0.30+avgRisk*0.25+avgCategory*0.20+netScore*0.15+(100-editorialPct>50?60:editorialPct>25?80:90)*0.10);

    // Findings
    const findings=[];
    if(dealPct>30)findings.push({severity:"warning",message:`Deal/coupon publishers make up ${Math.round(dealPct)}% of links — consider increasing editorial/content publishers for better incrementality`});
    if(extensionPct>10)findings.push({severity:"critical",message:`Browser extensions detected in ${Math.round(extensionPct)}% of links — high last-click interception risk`});
    if(unknownPct>20)findings.push({severity:"warning",message:`${Math.round(unknownPct)}% of publishers are unknown — audit these links to identify risks`});
    if(avgQuality<60)findings.push({severity:"warning",message:`Average publisher quality is ${avgQuality}/100 — consider recruiting higher-quality publishers`});
    if(netDiversity<3)findings.push({severity:"info",message:`Only ${netDiversity} networks detected — diversifying networks reduces platform risk`});
    if(editorialPct>40)findings.push({severity:"good",message:`Strong editorial/content publisher presence (${Math.round(editorialPct)}%) — good for incrementality`});
    if(avgQuality>=80)findings.push({severity:"good",message:`Excellent average publisher quality (${avgQuality}/100)`});

    return res.status(200).json({ok:true,version:"v4.7",total_urls:urls.length,analyzed:ok.length,duration_ms:Date.now()-start,
      health_score:healthScore,grade:healthScore>=80?"A":healthScore>=65?"B":healthScore>=50?"C":healthScore>=35?"D":"F",
      dimensions:{quality_score:avgQuality,risk_score:avgRisk,category_score:avgCategory,network_diversity:netDiversity,network_score:netScore},
      distribution:{editorial_pct:Math.round(editorialPct),deal_pct:Math.round(dealPct),extension_pct:Math.round(extensionPct),unknown_pct:Math.round(unknownPct),by_type:types,by_network:networks},
      findings,results
    });
  }catch(err){return res.status(500).json({ok:false,error:true,message:err.message})}
};
