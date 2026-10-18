import { kv } from '@vercel/kv';

async function freeTranslate(text,from,to){
  try{
    if(process.env.GROQ_API_KEY){
      const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{
        method:'POST',
        headers:{'Authorization':`Bearer ${process.env.GROQ_API_KEY}`,'Content-Type':'application/json'},
        body:JSON.stringify({model:'llama-3.3-70b-versatile',messages:[{role:'system',content:`Translate ${from} to ${to}. Only translation.`},{role:'user',content:text}],temperature:0.1})
      });
      const j=await r.json();
      if(j.choices?.[0]?.message?.content) return j.choices[0].message.content.trim();
    }
  }catch(e){}
  try{
    const r=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`);
    const j=await r.json(); return j.responseData?.translatedText||text;
  }catch{ return text; }
}

async function findMeaning(term){
  try{
    const d=await kv.hgetall('fixes');
    const all=Object.values(d||{});
    const l=term.toLowerCase().trim();
    const m=all.find(x=>x.text_original?.toLowerCase()===l);
    return m?.meaning||null;
  }catch{ return null; }
}

export default async function handler(req,res){
  const p={...req.query,...req.body};
  const from=p.From||''; const digits=p.Digits||''; const speech=p.SpeechResult||''; const trans=p.TranscriptionText||''; const input=(speech||trans||'').trim(); const mode=p.mode||'';
  
  if(digits==='1'){
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Burma dialects interpreting. Say Zomi or Burmese word.</Say><Gather input="speech" action="/api/voice?mode=burma_interpret" timeout="10"><Say>Say word.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  if(digits==='2'){
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Burma teaching. Say word means English. Example Lungdam means Thank you in Zomi.</Say><Record maxLength="30" action="/api/voice?mode=burma_teach" transcribe="true" transcribeCallback="/api/voice?mode=burma_teach" /><Gather numDigits="1" action="/api/voice?mode=burma_teach" timeout="10"><Say>Press 9 to save.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  if(digits==='3'){
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Spanish English instant. Press 1 English to Spanish, 2 Spanish to English, 3 for 3-way conference.</Say><Gather numDigits="1" action="/api/voice?mode=spanish_menu" timeout="10"><Say>Press 1,2,3.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  if(digits==='9'){
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Saved! Total grows. Press 1 Burma, 2 teaching, 3 Spanish.</Say><Gather numDigits="1" action="/api/voice" timeout="10"><Say>Press 1,2,3.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  if(mode==='spanish_menu'){
    if(digits==='1'){
      const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>English to Spanish. Say English.</Say><Gather input="speech" action="/api/voice?mode=es_en" timeout="10"><Say>Say English.</Say></Gather></Response>`;
      res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
    }
    if(digits==='2'){
      const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Spanish to English. Di en espanol.</Say><Gather input="speech" action="/api/voice?mode=es_es" timeout="10"><Say>Di en espanol.</Say></Gather></Response>`;
      res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
    }
    if(digits==='3'){
      const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>3-way conference. Enter second number then hash.</Say><Gather input="dtmf" finishOnKey="#" action="/api/voice?mode=spanish_conf" timeout="20"><Say>Enter number hash.</Say></Gather></Response>`;
      res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
    }
  }
  if(mode==='es_en'&&input){
    const t=await freeTranslate(input,'en','es');
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>${t}</Say><Gather input="speech" action="/api/voice?mode=es_en" timeout="10"><Say>Next.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  if(mode==='es_es'&&input){
    const t=await freeTranslate(input,'es','en');
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>${t}</Say><Gather input="speech" action="/api/voice?mode=es_es" timeout="10"><Say>Next.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  if(mode==='spanish_conf'){
    const second=(p.Digits||'').replace('#',''); const clean=second.startsWith('+')?second:`+${second}`; const conf=`nqai-spanish-${Date.now()}`;
    try{
      const client=(await import('twilio'))(process.env.TWILIO_ACCOUNT_SID,process.env.TWILIO_AUTH_TOKEN);
      await client.calls.create({to:clean,from:'+16152355215',twiml:`<Response><Say>Joining Spanish English 3-way.</Say><Dial><Conference>${conf}</Conference></Dial></Response>`});
    }catch(e){}
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Calling ${clean}. Conference ${conf}.</Say><Dial><Conference record="record-from-start">${conf}</Conference></Dial></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  if(mode==='burma_interpret'&&input){
    const m=await findMeaning(input);
    const ans=m?`${input} means ${m}`:`Teach me ${input} press 2`;
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>${ans}</Say><Gather input="speech" action="/api/voice?mode=burma_interpret" timeout="10"><Say>Next.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  if(mode==='burma_teach'&&(trans||input)){
    const full=trans||input; let term=full; let meaning=full;
    if(full.toLowerCase().includes(' means ')){ const idx=full.toLowerCase().indexOf(' means '); term=full.substring(0,idx).trim(); meaning=full.substring(idx+7).trim(); }
    try{ await kv.hset('fixes',{[Date.now()]:{type:'teach_record',text_original:term,meaning,timestamp:Date.now(),id:Date.now(),from_number:from}}); }catch{}
    const tw=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Taught ${term} means ${meaning}. Press 9.</Say><Gather numDigits="1" action="/api/voice?mode=burma_teach" timeout="10"><Say>Press 9.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(tw);
  }
  const init=`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Welcome to NqAI. Burma rare and Spanish instant.</Say><Gather numDigits="1" action="/api/voice" timeout="12"><Say>Press 1 Burma interpreting, 2 teaching, 3 Spanish instant.</Say></Gather></Response>`;
  res.setHeader('Content-Type','text/xml'); return res.status(200).send(init);
}
