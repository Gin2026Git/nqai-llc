export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const raw = (req.query.text || "").toString().trim();
  if(!raw) return res.json({original:"",translated:"",provider:"empty",lang:"auto",total:22,instant:true});
  const HF_TOKEN = process.env.HF_TOKEN || "";
  const targetRaw = (req.query.target || "eng").toString().toLowerCase();
  
  const D = {
    "ka dam":"I am fine","ka lung dam":"I am happy","ka dam hi":"I am fine",
    "na dam maw":"How are you","i":"I","keima":"I / Me","dam":"Fine"
  };

  // SKIP DICT when target is spa/mya/french - Go to NLLB for Hola
  const isNonEnglishTarget = ["spa","es","mya","my","fr","de","spanish","burmese"].includes(targetRaw);
  const t = raw.toLowerCase();
  if(!isNonEnglishTarget && D[t]){
    return res.json({original:raw,translated:D[t],provider:"zomi-dict-v2",lang:"zom",total:Object.keys(D).length,instant:true});
  }

  // NLLB MAP
  const MAP = {"spa":"spa_Latn","es":"spa_Latn","mya":"mya_Mymr","my":"mya_Mymr","eng":"eng_Latn","en":"eng_Latn"};
  let tgt = MAP[targetRaw] || "spa_Latn";
  if(targetRaw==="spa") tgt="spa_Latn";

  let translated = null, provider="fallback";
  if(HF_TOKEN){
    try{
      const r = await fetch("https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M",{
        method:"POST",
        headers:{"Authorization":`Bearer ${HF_TOKEN}`,"Content-Type":"application/json"},
        body:JSON.stringify({inputs:raw,parameters:{src_lang:"eng_Latn",tgt_lang:tgt}})
      });
      const j = await r.json();
      if(Array.isArray(j) && j[0]?.translation_text){ translated=j[0].translation_text; provider="nllb-200"; }
      else if(j?.translation_text){ translated=j.translation_text; provider="nllb-200"; }
    }catch(e){}
  }
  if(!translated) translated = raw; // fallback

  return res.json({original:raw,translated,provider,lang:targetRaw,total:22,instant:true});
}
