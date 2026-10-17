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

  async function tryHF(url){
    try{
      const r = await fetch(url,{
        method:"POST",
        headers:{"Authorization":`Bearer ${HF_TOKEN}`,"Content-Type":"application/json"},
        body:JSON.stringify({inputs:raw,parameters:{src_lang:src,tgt_lang:tgt}})
      });
      const j = await r.json();
      if(Array.isArray(j) && j[0]?.translation_text) return {ok:true,text:j[0].translation_text};
      if(j?.translation_text) return {ok:true,text:j.translation_text};
      return {ok:false,error: j?.error || JSON.stringify(j).slice(0,200)};
    }catch(e){ return {ok:false,error:e.message}; }
  }

  if(HF_TOKEN){
    // 1a. OLD endpoint - Still supports NLLB-200 - Works with Inference token
    let result = await tryHF("https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M");
    if(result.ok){ translated=result.text; provider="nllb-200"; }
    else {
      hfError = result.error;
      // 1b. Try new router - May fail with "not supported"
      let result2 = await tryHF("https://router.huggingface.co/hf-inference/models/facebook/nllb-200-distilled-600M");
      if(result2.ok){ translated=result2.text; provider="nllb-200"; hfError=""; }
      else { hfError = hfError + " | router: " + result2.error; }
    }
  } else { hfError = "No HF_TOKEN"; }

  if(!translated){
    try{
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(raw)}&langpair=${langPair}`;
      const r2 = await fetch(url);
      const j2 = await r2.json();
      if(j2?.responseData?.translatedText){
        translated = j2.responseData.translatedText;
        provider = hfError ? `mymemory-backup-hf:${hfError.slice(0,100)}` : "mymemory-backup";
      }
    }catch(e){}
  }

  if(!translated) translated = raw;
  return res.json({original:raw,translated,provider,lang:targetRaw,total:22,instant:true,hf_debug: hfError || "nllb-200 ok"});
}
