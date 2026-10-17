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

  const MAP = {"spa":"spa_Latn","es":"spa_Latn","mya":"mya_Mymr","my":"mya_Mymr","eng":"eng_Latn","en":"eng_Latn"};
  let tgt = MAP[targetRaw] || "spa_Latn";
  
  let translated = null; let provider="fallback";
  if(HF_TOKEN){
    try{
      const r = await fetch("https://router.huggingface.co/hf-inference/models/facebook/nllb-200-distilled-600M",{
        method:"POST",
        headers:{"Authorization":`Bearer ${HF_TOKEN}`,"Content-Type":"application/json"},
        body:JSON.stringify({inputs:raw,parameters:{src_lang:"eng_Latn",tgt_lang:tgt}})
      });
      const j = await r.json();
      if(Array.isArray(j) && j[0]?.translation_text){ translated=j[0].translation_text; provider="nllb-200"; }
      else if(j?.translation_text){ translated=j.translation_text; provider="nllb-200"; }
    }catch(e){}
  }
  if(!translated) translated = raw;

  return res.json({original:raw,translated,provider,lang:targetRaw,total:22,instant:true});
}
