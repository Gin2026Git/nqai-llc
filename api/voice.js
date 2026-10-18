import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const p = { ...req.query, ...req.body };
  const from = p.From || '';
  const to = p.To || '';
  const callSid = p.CallSid || '';
  const recUrl = p.RecordingUrl || '';
  const recSid = p.RecordingSid || '';
  const callStatus = p.CallStatus || '';

  // Save when recording exists or call completed
  if (callStatus === 'completed' || recUrl || recSid) {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const rec = {
      type: 'voice_call',
      text_original: '(recording) Kei ham / Kei pau / Damdam maw?',
      dialect_detected: 'thado-kuki + zomi-tedim',
      dialect: 'thado-kuki + zomi-tedim',
      meaning: 'Voice call - Kei ham Thado Kuki vs Kei pau Zomi/Tedim',
      from_number: from,
      to_number: to || '+16152355215',
      call_sid: callSid,
      recording_url: recUrl || (recSid ? `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Recordings/${recSid}` : ''),
      voice_soul: 'phone-6152355215',
      timestamp: Date.now(),
      id: id,
      source: 'voice.js-final-dictionary',
      lang: 'tcd'
    };
    try {
      await kv.hset('fixes', { [id]: rec });
    } catch (e) {
      console.error('KV save error', e);
    }
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say voice="Polly.Joanna">Welcome to NqAI LLC. Your Zopau, Tedim pau, Kei ham call is recorded to Family Vault.</Say><Say>Damdam maw? Kei pau ahih kei leh Kei ham ah hong gen in. Beep zawh ciang, khem in.</Say><Record maxLength="120" action="/api/voice" transcribe="true" /><Say>Lungdam! Your Kei pau and Kei ham saved. Thank you!</Say></Response>`;
  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml);
}
