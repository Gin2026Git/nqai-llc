import { kv } from '@vercel/kv';
function detectLanguage(text){
  const t=text.toLowerCase();
  if(/[\u1000-\u109F]/.test(text)) return 'burmese';
  if(t.includes('kei ham')) return 'thado-kuki';
  if(t.includes('kei pau')||t.includes('zopau')||t.includes('tedim')||t.includes('lungdam')||t.includes('damdam')) return 'zomi-tedim';
  if(t.includes('mingalaba')||t.includes('kye zu')) return 'burmese';
  return 'unknown';
}
export default async function handler(req,res){
  const p={...req.query,...req.body};
  const from=p.From||'unknown'; const body=(p.Body||'').trim();
  if(body){
    const id=Date.now()+'-'+Math.random().toString(36).slice(2,6);
    let term=body; let meaning=body; let type='sms_record';
    if(body.includes('=')){ const parts=body.split('='); term=parts[0].trim(); meaning=parts.slice(1).join('=').trim(); type='teach_record'; }
    const rec={type,text_original:term.substring(0,200),full_input:body.substring(0,500),dialect_detected:detectLanguage(body),meaning:meaning.substring(0,500),from_number:from,timestamp:Date.now(),id,teach:type==='teach_record'};
    try{ await kv.hset('fixes',{[id]:rec}); }catch(e){}
  }
  const twiml=`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Saved! Lungdam!</Message></Response>`;
  res.setHeader('Content-Type','text/xml'); return res.status(200).send(twiml);
}
