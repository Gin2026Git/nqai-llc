// api/sms.js - FINAL - Family Vault + 5 Free Text - hello@nqai.llc
import { kv } from '@vercel/kv';

function detectLanguage(text){
  const t = text.toLowerCase();
  if (/[\u1000-\u109F]/.test(t)) return 'burmese';
  if (t.includes('kei haw')) return 'thado-kuki';
  if (t.includes('keimaw') || t.includes('zomii') || t.includes('redim') || t.includes('lungdam') || t.includes('damdaw')) return 'zomi-zadin';
  if (t.includes('mingalaba') || t.includes('kyu zu')) return 'burmese';
  if (t.includes('hola') || t.includes('como')) return 'spanish';
  return 'english';
}

export default async function handler(req, res) {
  try {
    const from = (req.body.From || "").trim();
    const body = (req.body.Body || "").trim();
    console.log("SMS IN:", from, body);

    if (!body) {
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>NqAI: Send text to translate! hello@nqai.llc</Message></Response>`);
    }

    // 1. CHECK 5 FREE LIMIT with Redis
    let count = 0;
    try {
      const key = `sms_count:${from}`;
      count = (await kv.get(key)) || 0;
      if (count >= 5) {
        res.setHeader('Content-Type', 'text/xml');
        return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>NqAI: FREE limit 5 reached! Pay $5 for unlimited at nqai.llc - Family Vault saved! Lungdam! Reply STOP to opt-out</Message></Response>`);
      }
    } catch(e){ console.log("KV count error", e); }

    // 2. TEACH MODE: if contains "=" -> Save to Family Vault (Your kids!)
    if (body.includes("=")) {
      const parts = body.split("=");
      const term = parts[0].trim().substring(0,200);
      const meaning = parts.slice(1).join("=").trim().substring(0,500);
      const id = Date.now()+"_"+Math.random().toString(36).slice(2,6);
      const rec = {
        type: 'teach_record',
        term: term,
        meaning: meaning,
        dialect: detectLanguage(body),
        from: from,
        created: new Date().toISOString()
      };
      try { await kv.set(`fives:${id}`, rec); } catch(e){ console.log(e); }
      
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Saved! Lungdam! "${term}" = "${meaning}" saved to Family Vault! FREE ${count+1}/5 - nqai.llc</Message></Response>`);
    }

    // 3. TRANSLATE MODE: Normal text -> Translate
    const dialect = detectLanguage(body);
    let translated = `[Translated ${dialect}]: ${body}`; // Replace with OpenAI API later
    
    // Save sms record
    try {
      const id = Date.now()+"_"+Math.random().toString(36).slice(2,6);
      await kv.set(`fives:sms:${id}`, { type:'sms_record', from, original:body.substring(0,500), translated, dialect, created:new Date().toISOString() });
      await kv.set(`sms_count:${from}`, count+1, { ex: 86400*30 }); // 30 days
    } catch(e){ console.log("KV save error", e); }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>NqAI FREE ${count+1}/5 [${dialect}]: ${translated} -- Text friend number to send? Or reply with word=meaning to teach Family Vault! Lungdam! nqai.llc STOP to opt-out</Message>
</Response>`;
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml);

  } catch (e) {
    console.error("SMS CRASH:", e);
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Message>NqAI error, try again. hello@nqai.llc</Message></Response>`);
  }
}
