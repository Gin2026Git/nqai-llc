// api/voice.js - Real Phone No - Twilio + AI + Web + ML Recording -> nqai-fixes
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const params = { ...req.query, ...body };

  const callSid = params.CallSid || 'unknown';
  const from = params.From || params.Caller || 'unknown';
  const to = params.To || '+16152355215';
  const speech = params.SpeechResult || params.TranscriptionText || '';
  const recordingUrl = params.RecordingUrl || '';

  if (speech || recordingUrl) {
    const id = Date.now().toString() + '-' + Math.random().toString(36).slice(2,6);
    const record = {
      type: 'voice_call',
      text_original: speech || '(recording)',
      text_lang: 'auto',
      translated: '',
      to_lang: 'tcd',
      from_number: from,
      to_number: to,
      call_sid: callSid,
      recording_url: recordingUrl,
      voice_soul: 'phone-6152355215',
      timestamp: Date.now(),
      id,
      source: 'voice.js-one-brain',
      dialect: 'tcd'
    };
    try { await kv.hset('fixes', { [id]: record }); } catch (e) { console.error(e); }
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">Welcome to NqAI dot L L C. Your rare dialect call is recorded to Family Vault.</Say>
  <Say voice="Polly.Joanna">Please speak in Tedim or Zomi after the beep. Press any key when done.</Say>
  <Record maxLength="30" transcribe="true" transcribeCallback="https://nqai.llc/api/voice" recordingStatusCallback="https://nqai.llc/api/voice" />
  <Say>Thank you. Your voice is saved. Your translation will be at nqai dot L L C slash api slash fix. Goodbye.</Say>
  <Hangup/>
</Response>`;
  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml);
}
