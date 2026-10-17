export default async function handler(req, res){
  res.setHeader('Content-Type', 'text/xml');
  res.setHeader('Access-Control-Allow-Origin','*');
  const body = (req.body?.Body || req.query?.Body || req.query?.text || "Hello").toString().trim();
  
  // Call core translate logic - Reuse translate.js dict + NLLB
  const D = {"hola":"Hello","mingalaba":"Hello","ka dam":"I am fine"};
  const translated = D[body.toLowerCase()] || body;
  
  // For full NLLB - fetch your own API
  let finalText = translated;
  try {
    const r = await fetch(`https://nqai.llc/api/translate?text=${encodeURIComponent(body)}`);
    const j = await r.json();
    finalText = j.translated || translated;
  } catch(e){}

  return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Message>NqAI LLC 615-235-5215: ${body} => ${finalText} [Powered by 【entity-Meta¦canonical_name=Meta】 NLLB-200]</Message>
</Response>`);
}
