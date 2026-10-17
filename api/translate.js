export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const raw = (req.query.text || "").toString().trim();
  if(!raw) return res.json({original:"",translated:"",provider:"empty",lang:"auto",total:22,instant:true});
  const HF_TOKEN = process.env.HF_TOKEN || "";
  const targetRaw = (req.query.target || "eng").toString().toLowerCase();
  
  const D = {"ka dam":"I am fine","ka lung dam":"I am happy","i":"I","keima":"I / Me"};
  const isNonEnglish = ["spa","es","mya","my","spanish","burmese"].includes(targetRaw);
  const t = raw.toLowerCase();
  if(!isNonEnglish && D[t]){
    return res.json({original:raw,translated:D[t],provider:"zomi-dict-v2",lang:"zom",total:22,instant:true});
  }

  const MAP = {"spa":"spa_Latn","es":"spa_Latn","mya":"mya_Mymr","my":"mya_Mymr","eng":"eng_Latn"};
  let tgt = MAP[targetRaw] || "spa_Latn";
  let src = "eng_Latn";
  let langPair = "en|es";
  if(targetRaw==="mya" || targetRaw==="my") langPair = "en|my";

  let translated = null; let provider="fallback"; let hfError = "";

  // 1. Try NLLB-200 with new router - Permanent Inference token - NqAIhugging
  if(HF_TOKEN){
    try{
      const r = await fetch("https://router.huggingface.co/hf-inference/models/facebook/nllb-200-distilled-600M",{
        method:"POST",
        headers:{"Authorization":`Bearer ${HF_TOKEN}`,"Content-Type":"application/json"},
        body:JSON.stringify({inputs:raw,parameters:{src_lang:src,tgt_lang:tgt}})
      });
      const j = await r.json();
      console.log("HF status", r.status, "response", JSON.stringify(j).slice(0,800));
      if(Array.isArray(j) && j[0]?.translation_text){ translated=j[0].translation_text; provider="nllb-200"; }
      else if(j?.translation_text){ translated=j.translation_text; provider="nllb-200"; }
      else if(j?.error){ hfError = j.error; }
      else { hfError = JSON.stringify(j).slice(0,200); }
    }catch(e){ hfError = e.message; console.log("HF fetch error", e.message); }
  } else { hfError = "No HF_TOKEN env - Check Vercel Env Variables"; }

  // 2. Backup - MyMemory free - Guarantees Hola even if HF fails
  if(!translated){
    try{
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(raw)}&langpair=${langPair}`;
      const r2 = await fetch(url);
      const j2 = await r2.json();
      if(j2?.responseData?.translatedText){
        translated = j2.responseData.translatedText;
        provider = hfError ? `mymemory-backup-hf_error:${hfError.slice(0,120)}` : "mymemory-backup";
      }
    }catch(e){}
  }

  if(!translated) translated = raw;

  return res.json({original:raw,translated,provider,lang:targetRaw,total:22,instant:true,hf_debug: hfError ? hfError.slice(0,300) : "HF ok or not needed - nllb-200"});
}
