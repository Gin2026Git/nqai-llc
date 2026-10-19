// api/translate.js - NqAI One Brain - spa, eng, mya, tcd + ML self-recording
// Real Phone No.(Twilio+AI+Web+ML Recording)-Real Phone No - Handles:to=spa, eng, mya, tcd (Tedim rare) - Auto learns from /api/fix

let cacheFixes = null;
let cacheTime = 0;

async function loadFixes(host){
  if(cacheFixes && Date.now()-cacheTime < 5*60*1000) return cacheFixes;
  try{
    const r = await fetch(`https://${host}/api/fix`);
    const j = await r.json();
    cacheFixes = j.records || [];
    cacheTime = Date.now();
    return cacheFixes;
  }catch{ return []; }
}

const DICT = {
  tcd: {
    "how are you?": "Kei ham? Na dam hiam?",
    "how are you": "Kei ham?",
    "i love you": "Kei it Ing",
    "thank you": "Lungdam",
    "where are you?": "Kolah om na hiam?",
    "good morning": "Zingsang hoih",
    "good night": "Zan hoih",
    "are you safe?": "Na bit hiam?",
    "research": "Kan simna",
    "bro, how's research?": "Una, na kan simna bang hi hiam?"
  },
  mya: {
    "how are you?": "နေကောင်းလား",
    "are you safe?": "ဘေးကင်းလား",
    "thank you": "ကျေးဇူးတင်ပါတယ်",
    "i love you": "ချစ်တယ်"
  },
  spa: {
    "how are you?": "¿Cómo estás?",
    "i love you": "Te amo",
    "thank you": "Gracias"
  }
};

const LANG_MAP = {
  eng: "English", en: "English",
  spa: "Spanish", es: "Spanish",
  mya: "Burmese (Myanmar)",
  tcd: "Tedim Zomi dialect",
  auto: "auto-detected language"
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

  const body = req.method==='POST' ? (typeof req.body==='string' ? JSON.parse(req.body) : req.body) : {};
  const text = body.text || req.query.text || '';
  const from = body.from || req.query.from || 'auto';
  const to = body.to || req.query.to || 'eng';
  const caller = body.caller || req.query.caller || 'unknown';

  if(!text) return res.status(400).json({error:'text required'});

  const host = req.headers.host;
  const fixes = await loadFixes(host);
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

  const dictHit = dictTranslate(text, to);
  if(dictHit){
    return res.json({ translated: dictHit, source: 'dict-rare', dialect: to });
  }

  // Real Groq translation - Fixed with language names
  let translated = text;
  let debug = { hasGroqKey: !!process.env.GROQ_API_KEY, from, to };
  
  try{
    if(process.env.GROQ_API_KEY){
      const fromName = LANG_MAP[from] || from;
      const toName = LANG_MAP[to] || to;
      
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{'Authorization':`Bearer ${process.env.GROQ_API_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({
          model:'llama-3.3-70b-versatile',
          messages:[
            {role:'system',content:`You are NqAI professional translator. Translate from ${fromName} to ${toName}. Only output the translation, no explanation, no quotes.`},
            {role:'user',content:text}
          ],
          temperature:0.1
        })
      });
      
      const groqJ = await groqRes.json();
      debug.groqStatus = groqRes.status;
      debug.groqResponse = groqJ;
      
      if(groqJ.choices?.[0]?.message?.content){
        translated = groqJ.choices[0].message.content.trim();
      } else {
        debug.error = 'No choices in response';
      }
    } else {
      debug.error = 'No GROQ_API_KEY';
      const mmFrom = from==='eng'?'en':from==='spa'?'es':from;
      const mmTo = to==='eng'?'en':to==='spa'?'es':to;
      const mm = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${mmFrom}|${mmTo}`);
      const mmJ = await mm.json();
      if(mmJ.responseData?.translatedText) translated = mmJ.responseData.translatedText;
    }
  }catch(e){
    debug.catchError = e.message;
    console.log('translate error',e);
  }

  try{
    await fetch(`https://${host}/api/fix`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        type:'translate_record',
        text_original: text,
        text_lang: from,
        translated,
        to_lang: to,
        caller,
        voice_soul: caller,
        timestamp: new Date().toISOString(),
        source: 'translate.js-one-brain'
      })
    });
  }catch{}

  res.json({ translated, from, to, source:'groq+dict+ml', dialect: to, _debug: debug });
}
