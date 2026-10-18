import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const p = { ...req.query, ...req.body };
  const from = p.From || '';
  const to = p.To || '';
  const callSid = p.CallSid || '';
  const recUrl = p.RecordingUrl || '';
  const recSid = p.RecordingSid || '';
  const transcription = p.TranscriptionText || '';
  const digits = p.Digits || '';
  const callStatus = p.CallStatus || '';

  // Step 2: User pressed key after hearing teaching
  if (digits) {
    if (digits === '1') {
      // Save confirmed teaching - find last record from this number and mark confirmed
      try {
        const data = await kv.hgetall('fixes');
        const fromRecords = Object.values(data || {}).filter(r => r.from_number === from).sort((a,b)=>b.timestamp-a.timestamp);
        if (fromRecords[0]) {
          fromRecords[0].confirmed = true;
          fromRecords[0].confirmed_at = Date.now();
          await kv.hset('fixes', { [fromRecords[0].id]: fromRecords[0] });
        }
      } catch(e){}
      const twiml2 = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Confirmed! Your teaching saved to Family Vault. Lungdam! You can hang up or press 2 to teach more.</Say><Gather numDigits="1" action="/api/voice" timeout="10"><Say>Press 2 to teach another word, or hang up.</Say></Gather></Response>`;
      res.setHeader('Content-Type','text/xml'); return res.status(200).send(twiml2);
    }
    if (digits === '2') {
      const twimlReset = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Ok teach me. Say the Zomi word, then say means, then English. Example: Damdam maw means How are you in Zomi. After beep.</Say><Record maxLength="30" action="/api/voice" transcribe="true" transcribeCallback="/api/voice" /><Gather numDigits="1" action="/api/voice" timeout="5"><Say>Press 1 to save, 2 to teach again.</Say></Gather></Response>`;
      res.setHeader('Content-Type','text/xml'); return res.status(200).send(twimlReset);
    }
  }

  // Step 1: Recording completed with transcription
  if (transcription || recUrl || recSid || callStatus === 'completed') {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    let term = transcription || '(recording) Kei ham / Kei pau / Damdam maw?';
    let meaning = transcription || 'Voice teaching';
    let dialect = 'thado-kuki + zomi-tedim';
    let type = 'voice_call';

    // Parse teaching from transcription: "Damdam maw means How are you"
    const tLower = (transcription || '').toLowerCase();
    if (tLower.includes(' means ') || tLower.includes(' is ') || tLower.includes('=')) {
      type = 'teach_record';
      if (tLower.includes(' means ')) {
        const idx = tLower.indexOf(' means ');
        term = transcription.substring(0, idx).trim();
        meaning = transcription.substring(idx + 7).trim();
      } else if (tLower.includes(' is ')) {
        const idx = tLower.indexOf(' is ');
        term = transcription.substring(0, idx).trim();
        meaning = transcription.substring(idx + 4).trim();
      }
      if (term.toLowerCase().includes('kei ham')) dialect = 'thado-kuki';
      else dialect = 'zomi-tedim';
    }

    const rec = {
      type: type,
      text_original: term,
      full_input: transcription || term,
      dialect_detected: dialect,
      meaning: meaning,
      from_number: from,
      to_number: to || '+16152355215',
      call_sid: callSid,
      recording_url: recUrl || (recSid ? `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${recSid}` : ''),
      transcription: transcription,
      timestamp: Date.now(),
      id: id,
      source: type === 'teach_record' ? 'teach-voice' : 'voice.js-final-dictionary',
      lang: 'tcd',
      teach: type === 'teach_record'
    };
    try { await kv.hset('fixes', { [id]: rec }); } catch(e){}

    // Ask to press 1 to confirm save
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>You said: ${term}. Means: ${meaning}. Saved to Family Vault.</Say><Gather numDigits="1" action="/api/voice" timeout="10"><Say>Press 1 to confirm and save, Press 2 to teach another word, or hang up if correct.</Say></Gather></Response>`;
    res.setHeader('Content-Type','text/xml'); return res.status(200).send(twiml);
  }

  // Initial call
  const twimlInit = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">Welcome to NqAI Family Vault teaching mode.</Say><Say>Teach me Zomi or Thado Kuki. Say the word, then means, then English. Example: Damdam maw means How are you in Zomi. After beep, speak, then press 1 to save.</Say><Record maxLength="30" action="/api/voice" transcribe="true" transcribeCallback="/api/voice" /><Gather numDigits="1" action="/api/voice" timeout="10"><Say>Press 1 to confirm save, 2 to teach again.</Say></Gather></Response>`;
  res.setHeader('Content-Type','text/xml'); return res.status(200).send(twimlInit);
}
