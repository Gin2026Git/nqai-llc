export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=86400');
  
  const raw = (req.query.text || req.body?.text || "Hola").toString().trim();
  const t = raw.toLowerCase().replace(/[.!?]+$/,'').trim();
  
  const D = {
    "hola":"Hello","gracias":"Thank you","adios":"Goodbye","si":"Yes","no":"No","por favor":"Please",
    "buenos dias":"Good morning","buenas noches":"Good night",
    "mingalaba":"Hello","mingalabar":"Hello","nay kaung la":"How are you",
    "kyay zu tin bar tal":"Thank you","kyay zu":"Thank you","hawt":"Yes","ma hawt bu":"No",
    "na dam maw":"How are you","ka dam":"I am fine","ka lung dam":"I am happy",
    "ki pa maw":"Where are you going","bang ma":"Where","na min bang":"What is your name"
  };

  // Step 1: Fast dict - works right away - Phone + Computer
  let translated = D[t] || D[raw.toLowerCase()];
  
  // Step 2: If dict misses - Call NLLB-200 - Auto-detect Zomi / Burmese / Spanish / English
  if(!translated){
    try {
      // NLLB-200 fallback - Hugging Face Inference API - 201 languages
      // Replace with your HF token - Self-funded - No investor needed
      const HF_TOKEN = process.env.HF_TOKEN || "";
      if(HF_TOKEN){
        const r = await fetch("https://api-inference.huggingface.co/facebook/nllb-200-distilled-600M",{
          method:"POST",
          headers:{ "Authorization":`Bearer ${HF_TOKEN}`, "Content-Type":"application/json" },
          body: JSON.stringify({ inputs: raw, parameters:{ src_lang:"auto", tgt_lang:"eng_Latn" } })
        });
        const j = await r.json();
        translated = j[0]?.translation_text || raw;
      } else {
        translated = raw; // No token yet - return original - Still works
      }
    } catch(e){
      translated = raw;
    }
  }

  return res.json({
    original: raw,
    translated: translated,
    provider: translated===D[t] ? 'dict-v5' : 'nllb-200',
    lang: 'auto',
    total: Object.keys(D).length,
    instant: true
  });
}
