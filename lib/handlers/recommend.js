// lib/handlers/recommend.js
// BrandShuo — Publisher Recommendations
// GET /api/recommend?category=deal_coupon&exclude=slickdeals,retailmenot&limit=20
const publisherDB = require("../publisher-database");

module.exports = async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Methods","GET,OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS")return res.status(204).end();
  try{
    const url=new URL(req.url,"https://tools.brandshuo.com");const sp=url.searchParams;
    const category=sp.get("category")||"";const network=sp.get("network")||"";const region=sp.get("region")||"";
    const exclude=(sp.get("exclude")||"").split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
    const limit=Math.min(parseInt(sp.get("limit")||"20"),50);

    let pubs=publisherDB.PUBLISHERS.filter(p=>p.id&&p.publisher&&p.quality>=50).sort((a,b)=>(b.quality||0)-(a.quality||0));

    if(category)pubs=pubs.filter(p=>p.category===category);
    if(network)pubs=pubs.filter(p=>(p.networks||[]).some(n=>n.toLowerCase().includes(network.toLowerCase())));
    if(region)pubs=pubs.filter(p=>(p.region||"").toUpperCase()===region.toUpperCase());
    if(exclude.length)pubs=pubs.filter(p=>!exclude.includes(p.id)&&!exclude.includes((p.publisher||"").toLowerCase()));

    const results=pubs.slice(0,limit).map(p=>({id:p.id,publisher:p.publisher||p.name,group:p.group,category:p.category,publisher_type:p.publisherType||p.category,quality:p.quality,risk:p.incrementalityRisk,region:p.region||"Global",domains:(p.domains||[]).slice(0,2),networks:p.networks||[],amazon_tags:p.amazonTags||[]}));

    // Also show category stats
    const allInCategory=category?publisherDB.PUBLISHERS.filter(p=>p.category===category&&p.quality>=50).length:0;

    return res.status(200).json({ok:true,total:results.length,total_in_category:allInCategory,category,network,region,results});
  }catch(err){return res.status(500).json({ok:false,error:true,message:err.message})}
};
