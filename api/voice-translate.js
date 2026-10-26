// api/voice-translate.js - OPTION 2 - TRUE 3-WAY AUTO-TRANSLATE - MAJOR ON TOP + RARE TRAINING
// SOLE OWNER Gin P Khup - Smyrna TN - American English
// Flow: Caller -> Gather dest -> REST outbound to dest -> Both join Conference NqAI-xxx -> AI bot Gather speech -> Translate -> Say

export default async function handler(req, res) {
  res.setHeader('Content-Type','text/xml; charset=utf-8');
  res.setHeader('Cache-Control','no-store');

  const host = req.headers.host || 'nqai.llc';
  const base = `https://${host}`;
  const confParam = (req.query.conf || '').toString();
  const join = req.query.join;
  const langParam = (req.query.lang || 'en-US').toString();

  // Helper to get digits
  let digits = '';
  try {
    if (req.body?.Digits) digits = String(req.body.Digits);
    else if (typeof req.body === 'string') { const m=req.body.match(/Digits=([^&]*)/); if(m) digits=decodeURIComponent(m[1]); }
  } catch{}
  if (!digits) digits = (req.query.Digits || '').toString();
  digits = digits.replace(/\D/g,'');

  const speechText = (req.body?.SpeechResult || req.query?.SpeechResult || '').toString();
  const speechLang = (req.body?.SpeechLanguage || req.query?.SpeechLanguage || '').toString();

  // BRANCH 3: AI Interpreter Bot inside Conference - Speech -> Translate -> Speak Loop
  // This TwiML is what the AI bot does after joining conference
  if (join === 'bot' && confParam) {
    // If we heard speech, translate it
    if (speechText) {
      // Call translate API internally - major via Google, rare via NLLB+Seed1000
      let translated = speechText;
      let targetLang = 'es'; // default Spanish for demo, auto-detect will switch
      try {
        // Auto-detect source via Google/NLLB, translate
        const trResp = await fetch(`${base}/api/translate`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({ text: speechText, sourceLang: speechLang || 'auto', targetLang: 'auto', rareFallback: true })
        });
        if (trResp.ok) {
          const j = await trResp.json();
          translated = j.translated || speechText;
          targetLang = j.targetLang || targetLang;
        }
      } catch(e) {}

      // Say translated into conference - Polly voice for now, ElevenLabs via <Play> later
      const voiceMap = { es:'Polly.Miguel', en:'Polly.Matthew', my:'Polly.Matthew', bz:'Polly.Matthew', fr:'Polly.Mathieu', de:'Polly.Hans' };
      const voice = voiceMap[targetLang] || 'Polly.Matthew';
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}" language="${targetLang}">${translated.replace(/[<>&]/g, c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</Say>
  <Gather input="speech" speechTimeout="auto" speechModel="phone_call" enhanced="true" language="en-US,es-ES,es-MX,my-MM,fr-FR,de-DE" hints="hello hola burmese zomi" action="${base}/api/voice-translate?join=bot&amp;conf=${confParam}" method="POST" timeout="5">
    <Say voice="Polly.Matthew" language="en-US">.</Say>
  </Gather>
  <Redirect>${base}/api/voice-translate?join=bot&amp;conf=${confParam}</Redirect>
</Response>`;
      res.status(200).send(xml);
      return;
    }

    // No speech yet - start listening
    const xmlListen = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">NqAI interpreter ready. Auto detect major and rare languages. Speak now.</Say>
  <Gather input="speech" speechTimeout="auto" speechModel="phone_call" enhanced="true" language="en-US,es-ES,es-MX,my-MM,fr-FR,de-DE" hints="hello hola burmese zomi tedim" action="${base}/api/voice-translate?join=bot&amp;conf=${confParam}" method="POST" timeout="5">
    <Say voice="Polly.Matthew" language="en-US">Listening.</Say>
  </Gather>
  <Redirect>${base}/api/voice-translate?join=bot&amp;conf=${confParam}</Redirect>
</Response>`;
    res.status(200).send(xmlListen);
    return;
  }

  // BRANCH 2: Destination joins conference
  if (join === '1' && confParam) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Connecting you to NqAI Super Intelligence. Major languages active, rare languages training.</Say>
  <Dial><Conference maxParticipants="4" record="do-not-record" beep="false">${confParam}</Conference></Dial>
</Response>`;
    res.status(200).send(xml);
    return;
  }

  // BRANCH 1: Caller entered destination - Create conference + outbound dial + AI bot
  if (digits.length >= 10) {
    const confName = `NqAI-${Date.now()}`;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;

    if (sid && token) {
      const auth = Buffer.from(`${sid}:${token}`).toString('base64');
      const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`;

      // 1) Dial destination into conference
      const p1 = new URLSearchParams();
      p1.append('To', digits);
      p1.append('From', (process.env.TWILIO_PHONE_NUMBER || '+16150000000'));
      p1.append('Url', `${base}/api/voice-translate?join=1&conf=${confName}`);
      await fetch(url, {method:'POST', headers:{'Authorization':`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'}, body:p1.toString()}).catch(()=>{});

      // 2) Dial AI Interpreter Bot into same conference (speech-to-translate loop)
      const p2 = new URLSearchParams();
      p2.append('To', (process.env.TWILIO_PHONE_NUMBER || '+16150000000')); // bot calls self to trigger bot TwiML
      p2.append('From', (process.env.TWILIO_PHONE_NUMBER || '+16150000000'));
      p2.append('Url', `${base}/api/voice-translate?join=bot&conf=${confName}`);
      await fetch(url, {method:'POST', headers:{'Authorization':`Basic ${auth}`,'Content-Type':'application/x-www-form-urlencoded'}, body:p2.toString()}).catch(()=>{});
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Thank you. You dialed ${digits.split('').join(' ')}. Connecting with live interpreter. Major languages active on top, rare languages training. English, Spanish, Burmese, Zomi, French, German.</Say>
  <Dial><Conference maxParticipants="4" record="do-not-record" beep="false">${confName}</Conference></Dial>
</Response>`;
    res.status(200).send(xml);
    return;
  }

  // INITIAL: Ask for destination
  const xmlAsk = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System. Major languages working, rare languages training.</Say>
  <Gather numDigits="12" finishOnKey="#" action="/api/voice-translate" method="POST" timeout="15"><Say voice="Polly.Matthew" language="en-US">Please dial destination number, followed by pound.</Say></Gather>
  <Hangup/>
</Response>`;
  res.status(200).send(xmlAsk);
}
