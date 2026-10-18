// api/voice.js - FINAL - Twilio Phone-(Twilio+Web)-Phone - Uses native fix first
import { loadFixes } from './_fixes.js';

export default async function handler(req,res){
  const fixes = loadFixes();

  // Support both GET ?text=hello&target=mya and Twilio POST
  const q = req.method==='POST' ? (req.body || {}) : req.query;
  const text = (q.text || q.SpeechResult || q.Transcription || "Hello").toString().slice(0,300);
  const target = (q.target || q.ToLang || "mya").toString().toLowerCase();

  // Check native fix
  const key = `${target}-${text}`;
  let hasFix = false;
  let playUrl = null;
  if(fixes[key]){
    hasFix = true;
    playUrl = `https://nqai.llc/api/fix?play=${encodeURIComponent(key)}`;
  }else{
    // try find by text only
    for(let k in fixes){
      if(fixes[k].text===text){ hasFix=true; playUrl=`https://nqai.llc/api/fix?play=${encodeURIComponent(k)}`; break; }
    }
  }

  // Build TwiML
  res.setHeader('Content-Type','text/xml');
  let twiml = `<?xml version="1.0" encoding="UTF-8"?><Response>`;

  if(hasFix && playUrl){
    // Play native good accent
    twiml += `<Play>${playUrl}</Play>`;
    twiml += `<Pause length="0.5"/>`;
    // Optional say text too for fallback
    twiml += `<Say voice="Polly.Aditi" language="en-US">Native fix played.</Say>`;
  }else{
    // No fix - robot fallback - readable voice
    const langMap = { mya:"my-MM", spa:"es-ES", fr:"fr-FR", de:"de-DE", zomi:"en-US", tcd:"en-US" };
    const sayLang = langMap[target] || "en-US";
    // For Burmese, Twilio Polly doesn't have my-MM, use English say + note
    if(target==="mya"){
      twiml += `<Say>Native fix not yet. Text is: ${text}. Please record good accent on nqai dot llc slash web.</Say>`;
    }else{
      twiml += `<Say language="${sayLang}">${text}</Say>`;
    }
  }

  twiml += `<Gather input="speech" timeout="3" language="en-US" action="/api/voice?target=${target}" method="POST"><Say>Speak next sentence.</Say></Gather>`;
  twiml += `</Response>`;

  return res.status(200).send(twiml);
}
