// api/fix.js - FINAL - Save native Burmese/Zomi/Spanish accent fixes
import { loadFixes, saveFixes } from './_fixes.js';

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS') return res.status(200).end();

  const fixes = loadFixes();

  // GET ?play=key -> return audio file for Twilio <Play>
  if(req.query.play){
    const key = req.query.play;
    const item = fixes[key];
    if(!item || !item.audio) return res.status(404).send("no fix");
    const base64 = item.audio.split(',')[1] || item.audio;
    const buf = Buffer.from(base64, 'base64');
    res.setHeader('Content-Type', 'audio/webm');
    return res.status(200).send(buf);
  }

  // GET ?text=နေကောင်းလား&target=mya -> check if fix exists
  if(req.method==='GET'){
    const {text, target} = req.query;
    if(text){
      const key = `${target||'mya'}-${text}`;
      if(fixes[key]) return res.status(200).json({found:true, key, ...fixes[key]});
      // also try search by text only
      for(let k in fixes){
        if(fixes[k].text===text) return res.status(200).json({found:true, key:k, ...fixes[k]});
      }
    }
    return res.status(200).json({fixes, total:Object.keys(fixes).length});
  }

  // POST {text, target, audio} -> save
  if(req.method==='POST'){
    try{
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const {text, target, audio} = body || {};
      if(!text || !audio) return res.status(400).json({error:"text and audio required"});
      const key = `${target||'mya'}-${text}`;
      fixes[key] = {text, target: target||'mya', audio, time: Date.now()};
      saveFixes(fixes);
      console.log("Native fix saved:", key);
      return res.status(200).json({saved:true, key, total:Object.keys(fixes).length, playUrl:`/api/fix?play=${encodeURIComponent(key)}`});
    }catch(e){
      return res.status(500).json({error:e.message});
    }
  }

  return res.status(200).json({ok:true});
}
