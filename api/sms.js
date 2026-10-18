// api/sms.js - SMS -> nqai-fixes persistent
import { kv } from '@vercel/kv';
export default async function handler(req,res){
  const p={...req.query,...req.body};
  const from=p.From||'unknown'; const body=p.Body||''; const sid=p.MessageSid||Date.now().toString();
  if(body){
    const id=Date.now()+'-'+Math.random().toString(36).slice(2,6);
    const rec={type:'sms_record',text_original:body,text_lang:'auto',translated:'',to_lang:'tcd',from_number:from,to_number:'+16152355215',message_sid:sid,voice_soul:'sms-6152355215',timestamp:Date.now(),id,source:'sms.js-one-brain',dialect:'tcd'};
    try{await kv.hset('fixes',{ [id]: rec });}catch(e){console.error(e);}
  }
  const twiml=`<?xml version="1.0"?><Response><Message>Ngai Family Vault ah na thu hong ki save ta. Nqai.llc ah en in. Thank you!</Message></Response>`;
  res.setHeader('Content-Type','text/xml'); return res.status(200).send(twiml);
}
