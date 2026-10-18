import { kv } from '@vercel/kv';
export default async function handler(req,res){
  const p={...req.query,...req.body};
  const from=p.From||''; const to=p.To||''; const callSid=p.CallSid||''; const recUrl=p.RecordingUrl||'';
  if(p.CallStatus==='completed' || recUrl || p.RecordingSid){
    const id=Date.now()+'-'+Math.random().toString(36).slice(2,6);
    const rec={type:'voice_call',text_original:'(recording) Kei ham / Kei pau',from_number:from,to_number:to||'+16152355215',call_sid:callSid,recording_url:recUrl||'https://api.twilio.com/2010-04-01/Accounts/'+process.env.TWILIO_ACCOUNT_SID+'/Recordings/'+(p.RecordingSid||''),voice_soul:'phone-6152355215',timestamp:Date.now(),id,source:'voice.js-final-dictionary',dialect:'thado-kuki + zomi-tedim'};
    try{await kv.hset('fixes',{ [id]: rec });}catch(e){}
  }
  const twiml=`<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">Welcome to NqAI LLC. Your Zopau, Tedim pau, Kei ham call is recorded to Family Vault.</Say><Say>Damdam maw? Kei pau ahih kei leh Kei ham ah hong gen in. Beep zawh ciang, khem in.</Say><Record maxLength="120" action="/api/voice" transcribe="true" /><Say>Lungdam! Your Kei pau and Kei ham saved. Thank you!</Say></Response>`;
  res.setHeader('Content-Type','text/xml'); return res.status(200).send(twiml);
}
