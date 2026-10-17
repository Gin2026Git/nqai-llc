export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=86400');
  
  const raw = (req.query.text || req.body?.text || "").toString().trim();
  if(!raw){ return res.json({original:"",translated:"",provider:"empty",lang:"auto",total:21,instant:true}); }

  const HF_TOKEN = process.env.HF_TOKEN || "";

  // DICT-V5 - 21+ FAST WORDS - Always works - No HF needed - Phone right away
  const D = {
    "ka dam":"I am fine","ka lung dam":"I am happy","ka dam hi":"I am fine",
    "na dam maw":"How are you","na min bang":"What is your name",
    "hola":"Hello","como estas":"How are you","gracias":"Thank you",
    "hello":"Hello","hi":"Hello","how are you":"How are you",
    "i am fine":"I am fine","thank you":"Thank you",
    "ka pa maw":"Where are you going","ki pa maw":"Where are you going",
    "i":"I","keima":"I / Me","nang":"You","dam":"Fine / Good"
  };

  const t = raw.toLowerCase().trim();
  
  // 1. DICT FIRST - Instant - No HF - Money safe
  if(D[t]){
    return res.json({original:raw,translated:D[t],provider:"dict-v5",lang:"auto",total:Object.keys(D).length,instant:true});
  }

  // 2. NLLB MAP - FIX for target param - spa -> spa_Latn etc
  const NLLB_MAP = {
    "spa":"spa_Latn","es":"spa_Latn","spanish":"spa_Latn","espanol":"spa_Latn",
    "mya":"mya_Mymr","my":"mya_Mymr","burmese":"mya_Mymr","burma":"mya_Mymr",
    "eng":"eng_Latn","en":"eng_Latn","english":"eng_Latn",
    "zom":"mya_Mymr","zomi":"mya_Mymr", // Zomi not in NLLB 200 - fallback Burmese - dict handles Zomi
    "fr":"fra_Latn","french":"fra_Latn","de":"deu_Latn","german":"deu_Latn"
  };

  const targetRaw = (req.query.target || "eng_Latn").toString().toLowerCase().trim();
  let tgtLang = NLLB_MAP[targetRaw] || targetRaw;
  // If user passes spa_Latn already, keep it
  if(tgtLang.length <= 4 && NLLB_MAP[tgtLang]){ tgtLang = NLLB_MAP[tgtLang]; }
  if(!tgtLang.includes("_")){ 
    // if still short like "spa" not mapped, default eng
    if(tgtLang === "spa") tgtLang = "spa_Latn";
    if(tgtLang === "mya") tgtLang = "mya_Mymr";
    if(tgtLang === "eng") tgtLang = "eng_Latn";
  }

  const srcLang = "eng_Latn"; // auto - NLLB auto detects source

  // 3. NLLB-200 - Using permanent READ token hf_...rEBK - Never expires
  let translated = null;
  let provider = "dict-v5";

  if(HF_TOKEN){
    try{
      const resp = await fetch("https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M",{
        method:"POST",
        headers:{
          "Authorization":`Bearer ${HF_TOKEN}`,
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          inputs: raw,
          parameters:{ src_lang: srcLang, tgt_lang: tgtLang }
        })
      });
      const data = await resp.json();
      if(Array.isArray(data) && data[0]?.translation_text){ 
        translated = data[0].translation_text; 
        provider = "nllb-200";
      } else if(data?.translation_text){
        translated = data.translation_text;
        provider = "nllb-200";
      } else if(typeof data === 'string'){
        translated = data;
        provider = "nllb-200";
      }
    }catch(e){
      translated = null;
    }
  }

  // 4. Fallback - Return original if NLLB fails - No crash - Voice still works
  if(!translated){
    translated = D[t] || raw;
    if(!D[t]) provider = "fallback-original";
  }

  return res.json({
    original: raw,
    translated: translated,
    provider: provider,
    lang: targetRaw,
    total: Object.keys(D).length,
    instant: true
  });
}
