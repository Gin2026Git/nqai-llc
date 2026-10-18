import { kv } from '@vercel/kv';
export default async function handler(req,res){
  const p={...req.query,...req.body};
  const from=p.From||'unknown'; const body=(p.Body||'').trim(); const sid=p.MessageSid||Date.now().toString();
  if(body){
    const id=Date.now()+'-'+Math.random().toString(36).slice(2,6);
    let dialect='unknown';
    const bLower=body.toLowerCase();
    if(bLower.includes('kei ham')) dialect='thado-kuki';
    else if(bLower.includes('kei pau')||bLower.includes('zopau')||bLower.includes('tedim')) dialect='zomi-tedim';
    if(bLower.includes('damdam')||bLower.includes('dam maw')) dialect='zomi-tedim';

    const rec={
      type:'sms_record',
      text_original:body,
      dialect_detected:dialect,
      meaning: dialect==='thado-kuki' ? 'my dialect Thado Kuki' : dialect==='zomi-tedim' ? 'Zopau/Tedim pau' : 'rare',
      from_number:from,
      to_number:'+16152355215',
      message_sid:sid,
      timestamp:Date.now(),
      id, source:'sms.js-one-brain-final', lang:'tcd'
    };
    try{await kv.hset('fixes',{ [id]: rec });}catch(e){console.error(e);}
  }
  const twiml=`<?xml version="1.0" encoding="UTF-8"?><Response><Message>Damdam maw? Kei pau / Kei ham thu ka ngah ta. Family Vault ah ki save ta - nqai.llc. Lungdam!</Message></Response>`;
  res.setHeader('Content-Type','text/xml'); return res.status(200).send(twiml);
}
