// api/translate.js - NqAI - Zomi 500 + 100 free - FINAL FIX
import zomiDict from './zomi.js';

export default async function handler(req, res){
  // CORS
  res.setHeader('Access-Control-Allow-Origin','*');
  const {text="", target="zomi"} = req.query;
  if(!text) return res.status(200).json({translated:"", provider:"empty", total:0});
  
  const t = String(target).toLowerCase().trim();
  const q = String(text).trim();
  const lower = q.toLowerCase();

  // ---- ZOMI 500 ----
  if(t==="zomi" || t==="tcd" || t==="zom" || t==="zomi-tedim"){
    try{
      let dict = zomiDict;
      // handle different export shapes
      if(dict && dict.default) dict = dict.default;
      if(dict && dict.zomi) dict = dict.zomi;
      if(dict && dict.dict) dict = dict.dict;
      const found = dict[lower] || dict[q] || dict[q.toLowerCase()];
      if(found){
        return res.status(200).json({translated:found, provider:"zomi-dict-500", total:500, target:"zomi"});
      }
    }catch(e){}
    // not found - return original with note
    return res.status(200).json({translated:q, provider:"zomi-dict-500-notfound", total:500, note:"not in 500, add to api/zomi.js"});
  }

  // ---- OTHER 100 FREE - MyMemory ----
  try{
    const map = {spa:"es", spanish:"es", mya:"my", burmese:"my", fr:"fr", french:"fr", de:"de", ja:"ja", en:"en"};
    const to = map[t] || t;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=en|${to}`;
    const r = await fetch(url);
    const j = await r.json();
    let translated = j?.responseData?.translatedText || "";
    translated = String(translated).trim();
    // Clean MyMemory warning prefix
    if(translated && translated !== q){
      return res.status(200).json({translated, provider:"mymemory-free-100", total:100, target:to});
    }
  }catch(e){
    // ignore
  }

  // fallback
  return res.status(200).json({translated:q, provider:"mymemory-error-fallback", total:100, target:t});
}
