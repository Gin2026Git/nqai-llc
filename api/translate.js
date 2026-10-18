// api/translate.js - NqAI One Brain - spa, eng, mya, tcd + ML self-recording
// Real Phone No-(Twilio+AI+Web+ML Recording)-Real Phone No
// Handles: ?to=spa, eng, mya, tcd (Tedim rare) - Auto learns from /api/fix

let cacheFixes = null;
let cacheTime = 0;

async function loadFixes(host){
  // Cache 5 min
  if(cacheFixes && Date.now()-cacheTime < 5*60*1000) return cacheFixes;
  try{
    const r = await fetch(`https://${host}/api/fix`);
    const j = await r.json();
    cacheFixes = j.records || [];
    cacheTime = Date.now();
    return cacheFixes;
  }catch{ return []; }
}

// Rare dictionaries - merged from zomi.js + burmese.js + spanish.js
const DICT = {
  tcd: {
    "how are you?": "Kei ham? Na dam hiam?",
    "how are you": "Kei ham?",
    "i love you": "Kei it ing",
    "thank you": "Lungdam",
    "where are you?": "Koiah om na hiam?",
    "good morning": "Zingsang hoih",
    "good night": "Zan hoih",
    "are you safe?": "Na bit hiam?",
    "research": "Kan simna",
    "bro, how's research?": "Una, na kan simna bang hi hiam?",
  },
  mya: {
    "how are you?": "နေကောင်းလား",
    "are you safe?": "အေးဆေးပဲမလား",
    "thank you": "ကျေးဇူးတင်ပါတယ်",
    "i love you": "ချစ်တယ်",
  },
  spa: {
    "how are you?": "¿Cómo estás?",
    "i love you": "Te amo",
    "thank you": "Gracias",
  }
};

function dictTranslate(text, to){
  if(!DICT[to]) return null;
  const key = text.toLowerCase().trim();
  return DICT[to][key] || null;
}

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  if(req.method==='OPTIONS') return res.status(200).end();

  const body = req.method==='POST' ? (typeof req.body==='string'? JSON.parse(req.body) : req.body) : {};
  const text = body.text || req.query.text || '';
  const from = body.from || req.query.from || 'auto';
  const to = body.to || req.query.to || 'eng'; // spa, eng, mya, tcd
  const caller = body.caller || req.query.caller || 'unknown';

  if(!text) return res.status(400).json({error:'text required'});

  // 1. Check ML self-recorded fixes first - Rare dialects by self
  const host = req.headers.host;
  const fixes = await loadFixes(host);
  // Find exact loved correction
  const loved = fixes.filter(f=>f.ml_text && f.ml_loved && f.text_lang?.includes(to)).reverse();
  for(const f of loved){
    if(f.ml_text.toLowerCase()===text.toLowerCase()){
      return res.json({
        translated: f.ml_correction || f.text_original,
        source: 'ml-self-recorded-loved',
        dialect: to,
        voice_soul: f.ml_voice_soul || caller
      });
    }
  }

  // 2. Check dictionary - Rare Tedim 500 by self
  const dictHit = dictTranslate(text, to);
  if(dictHit){
    return res.json({ translated: dictHit, source: 'dict-rare', dialect: to });
  }

  // 3. NLLB-200 translation - Production use HuggingFace API
  // For now, placeholder - Replace with real NLLB call when you have HF token
  let translated = text; // Fallback
  try{
    // Example real call:
    // const hfRes = await fetch('https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M', {...})
    // translated = await hfRes...
    
    // Simple mock for Spanish/English until HF connected
    if(to==='spa' && from==='eng'){
      translated = `[ES] ${text}`;
    } else if(to==='eng' && from==='spa'){
      translated = `[EN] ${text}`;
    } else {
      translated = `[${to}] ${text}`; // Will be replaced by NLLB
    }
  }catch(e){
    translated = dictHit || text;
  }

  // 4. Save this translation pair for future self-learning
  try{
    await fetch(`https://${host}/api/fix`,{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        type:'translate_record',
        text_original: text,
        text_lang: from,
        translated,
        to_lang: to,
        voice_soul: caller,
        timestamp: new Date().toISOString(),
        source: 'translate.js-one-brain'
      })
    });
  }catch{}

  res.json({ translated, from, to, source:'nllb+dict+ml', dialect: to });
}
