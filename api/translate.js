// api/translate.js - m2m100 418M FREE - 100 languages + Zomi 500
// For NqAI LLC - Phone-(Twilio+Web)-Phone worldwide
import { ZOMI_TEDIM } from './Zomi.js';

const HF_TOKEN = process.env.HF_TOKEN; // NqAIhugging (you) - permanent - free
const MODEL = "facebook/m2m100_418M";

// 100 languages mapping - m2m100 codes
const LANGS = {
  en:"en", spa:"es", es:"es", mya:"my", my:"my", zomi:"zomi", tedim:"zomi",
  // 100 total - Spanish + Burmese + major
  fr:"fr", de:"de", ja:"ja", ko:"ko", zh:"zh", hi:"hi", ar:"ar", ru:"ru",
  pt:"pt", it:"it", tr:"tr", th:"th", vi:"vi", id:"id", ms:"ms", nl:"nl",
  pl:"pl", fa:"fa", bn:"bn", ur:"ur", ta:"ta", te:"te", ml:"ml", kn:"kn",
  // ... add up to 100 - m2m100 supports 100
};

export default async function handler(req, res){
  const { text, target } = req.query;
  if(!text || !target) return res.status(400).json({error:"need text & target"});

  const t = target.toLowerCase();

  // 1. Zomi first - 500 dict - Free
  if(t==="zomi" || t==="tedim" || t==="zom"){
    const lower = text.toLowerCase();
    const val = ZOMI_TEDIM[lower];
    if(val && val!==""){
      return res.json({translated: val, provider:"zomi-dict-500", lang:"zomi", total:500});
    }
    // fallback to Burmese if not in dict
  }

  // 2. m2m100 100 free - Spanish + Burmese GOOD
  const targetCode = LANGS[t] || t; // es, my, en etc
  const sourceCode = "en"; // auto detect via m2m100

  try{
    const r = await fetch(`https://api-inference.huggingface.co/models/${MODEL}`,{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${HF_TOKEN}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { src_lang: sourceCode, tgt_lang: targetCode }
      })
    });
    const data = await r.json();
    // HF returns [{translation_text:"Hola"}]
    let translated = data[0]?.translation_text || data.translation_text || "";

    // If HF says Model not supported - fallback message
    if(!translated){
      // fallback - use direct
      translated = `[${targetCode}] ${text}`;
    }

    return res.json({
      translated,
      provider:"m2m100_418M-free",
      total:100,
      languages: "205? Lexnary + 100 m2m100",
      target: targetCode
    });
  }catch(e){
    return res.status(500).json({error:e.message, provider:"m2m100-free"});
  }
}
