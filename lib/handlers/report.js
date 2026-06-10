// lib/handlers/report.js
// BrandShuo — Competitive Intelligence Report
// POST /api/report — full competitive analysis of a domain
const { analyzeLink } = require("../analyze");
const { followRedirectChain, isShortener } = require("../redirect-follower");
const publisherDB = require("../publisher-database");
const https = require("https"), http = require("http"), { URL } = require("url");

const AFFILIATE_PARAMS = ["tag=","ascsubtag","irclickid","irgwc=","cjevent=","cjdata=","awc=","awinaffid","raneaid=","ranmid=","ransiteid=","clickref=","pb=","pb_clickid","partnerboost","levanta=","rfsn=","sscid=","gclid=","fbclid=","ttclid=","msclkid=","maas=","skimresources","redirect.viglink.com","shop-links.co","prf.hn","pntra.com","rover.ebay.com","goto.walmart.com"];

async function fetchPage(url, timeout=12000){return new Promise((resolve,reject)=>{const p=new URL(url);const c=p.protocol==="https:"?https:http;const req=c.request({hostname:p.hostname,port:p.port,path:p.pathname+p.search,method:"GET",headers:{"User-Agent":"BrandShuo-Reporter/4.7",Accept:"text/html,*/*"},timeout},res=>{if([301,302,303,307,308].includes(res.statusCode)){const loc=res.headers.location;if(loc){try{return fetchPage(new URL(loc,url).href,timeout-3000).then(resolve).catch(reject)}catch{return reject(new Error("Invalid redirect"))}}};const chunks=[];res.on("data",c=>{chunks.push(c);if(chunks.reduce((s,x)=>s+x.length,0)>800000)res.destroy()});res.on("end",()=>resolve({statusCode:res.statusCode,body:Buffer.concat(chunks).toString("utf8"),finalUrl:url}));res.on("error",reject)});req.on("error",reject);req.on("timeout",()=>{req.destroy();reject(new Error("timeout"))});req.end()})}

function extractLinks(html,baseUrl){const links=new Set();const re=/<a\s[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/gi;let m;while((m=re.exec(html))!==null){try{links.add(new URL(m[1],baseUrl).href)}catch{}}return [...links]}

module.exports = async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin","*");res.setHeader("Access-Control-Allow-Methods","POST,OPTIONS");res.setHeader("Access-Control-Allow-Headers","Content-Type");
  if(req.method==="OPTIONS")return res.status(204).end();
  try{
    const {url,max_links=200}=req.body||{};if(!url)return res.status(400).json({ok:false,error:true,message:"Missing URL"});
    const start=Date.now();const page=await fetchPage(url.trim());
    const allLinks=extractLinks(page.body,url);
    const affLinks=allLinks.filter(l=>AFFILIATE_PARAMS.some(p=>l.toLowerCase().includes(p))).slice(0,max_links);
    const results=affLinks.map(l=>{try{const a=analyzeLink(l);return{url:l,ok:true,platform:a.platform||"—",network:a.network||"—",publisher:a.publisher||"—",publisher_id:a.publisher_id,quality:a.quality_score||a.traffic_quality||0,risk:a.incrementality_risk||"—",channel_role:a.channel_role||"—",category:a.publisher_type||"—"}}catch{return{url:l,ok:false,error:"analysis_failed"}}});

    // Build competitive report
    const successful=results.filter(r=>r.ok&&r.network&&r.network!=="Unknown");
    const networks={};const publishers={};const categories={};const roles={};const risks={};
    successful.forEach(r=>{
      networks[r.network]=(networks[r.network]||0)+1;
      if(r.publisher&&r.publisher!=="Unknown Publisher")publishers[r.publisher]=(publishers[r.publisher]||0)+1;
      if(r.category)categories[r.category]=(categories[r.category]||0)+1;
      if(r.channel_role)roles[r.channel_role]=(roles[r.channel_role]||0)+1;
      if(r.risk)risks[r.risk]=(risks[r.risk]||0)+1;
    });

    // Quality distribution
    const qualities=successful.map(r=>r.quality).filter(q=>q>0);
    const avgQuality=qualities.length?Math.round(qualities.reduce((a,b)=>a+b,0)/qualities.length):0;
    const topPublishers=Object.entries(publishers).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([name,count])=>{
      const p=publisherDB.PUBLISHERS.find(x=>(x.publisher||x.name)===name);
      return {publisher:name,links:count,group:p?.group||"—",quality:p?.quality||"—",risk:p?.incrementalityRisk||"—",region:p?.region||"—"};
    });

    // Category breakdown for recruitment recommendations
    const categoriesFound=[...new Set(successful.map(r=>r.category).filter(Boolean))];
    const topCategory=categoriesFound[0];
    let recommendations=[];
    if(topCategory){
      recommendations=publisherDB.PUBLISHERS.filter(p=>p.category===topCategory&&!publishers[p.publisher||p.name]).sort((a,b)=>(b.quality||0)-(a.quality||0)).slice(0,10).map(p=>({id:p.id,publisher:p.publisher||p.name,group:p.group,quality:p.quality,risk:p.incrementalityRisk,networks:(p.networks||[]).slice(0,3),region:p.region||"Global"}));
    }

    // Risk summary
    const riskSummary={high:risks["High"]||0+risks["Very High"]||0,medium:risks["Medium"]||0+risks["Medium-High"]||0,low:risks["Low"]||0+risks["Low-Medium"]||0};
    const riskScore=riskSummary.high>riskSummary.low*2?"High":riskSummary.high>riskSummary.low?"Medium-High":riskSummary.low>riskSummary.high*2?"Low":"Medium";

    return res.status(200).json({ok:true,version:"v4.7",scanned_url:url,total_links:allLinks.length,affiliate_links:results.length,successful_analysis:successful.length,duration_ms:Date.now()-start,
      summary:{networks:Object.keys(networks).length,publishers:Object.keys(publishers).length,categories:categoriesFound.length,avg_quality:avgQuality,risk_score:riskScore},
      top_networks:Object.entries(networks).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>({network:k,count:v})),
      top_publishers:topPublishers,
      category_distribution:Object.entries(categories).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({category:k,count:v})),
      role_distribution:Object.entries(roles).sort((a,b)=>b[1]-a[1]).map(([k,v])=>({role:k,count:v})),
      risk_distribution:risks,risk_score:riskScore,
      recommendations:{category:topCategory,message:`Based on ${topCategory||"analysis"}, consider these publishers not found on this site:`,publishers:recommendations},
      results:results.slice(0,50)
    });
  }catch(err){return res.status(500).json({ok:false,error:true,message:err.message})}
};
