// NqAI LLC - SOLE OWNER Gin P Khup - voice.js - 3-way AI Live Voice Interpreter - FIXED
// api/voice.js - Twilio Media Streams + Deepgram ASR + Google/NLLB + ElevenLabs TTS + Conference

import { twiml } from 'twilio';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export default async function voiceHandler(req, res) {
  // Twilio webhook when caller dials NqAI number
  const { CallSid, From, To, ConferenceSid } = req.body;
  
  console.log(`[VOICE 3-WAY] New call: ${CallSid} From: ${From} To: ${To} Conf: ${ConferenceSid}`);
  
  // TwiML: Join conference + start Media Stream for real-time ASR
  const response = new twiml.VoiceResponse();
  
  // 1. Join 3-way conference (caller + interpreter + third party via join-conference.js)
  const dial = response.dial();
  dial.conference({
    statusCallback: '/api/conf-status',
    statusCallbackEvent: 'start end join leave',
    startConferenceOnEnter: true,
    endConferenceOnExit: false,
  }, `NqAI-${ConferenceSid || CallSid}`);
  
  // 2. Start Media Stream for real-time voice translation (8kHz phone -> 16kHz for ASR)
  // This streams to your /api/translator-bot.js which does ASR -> Translate -> TTS
  response.connect().stream({
    url: `wss://${process.env.VERCEL_URL}/api/translator-bot`,
    track: 'inbound_track',
    parameter: [
      { name: 'CallSid', value: CallSid },
      { name: 'ConferenceSid', value: ConferenceSid || `NqAI-${CallSid}` }
    ]
  });
  
  // For initial testing: Say welcome in English + Spanish
  // response.say({ voice: 'Polly.Miguel', language: 'es-ES' }, 'Bienvenido a NqAI, el teléfono que habla todos los idiomas. Conectando intérprete...');
  
  res.set('Content-Type', 'text/xml');
  return res.status(200).send(response.toString());
}

// For major languages: Use Deepgram Nova-2 for 8kHz phone Spanish (better than Whisper for phone)
// For rare: Whisper large-v3
export async function transcribeWithDeepgram(audioBase64, language = 'es') {
  // Deepgram handles 8kHz phone audio natively - better than Whisper for Spanish phone calls
  const dgRes = await fetch('https://api.deepgram.com/v1/listen?language=' + language + '&model=nova-2-phonecall&encoding=mulaw&sample_rate=8000', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${DEEPGRAM_API_KEY}`,
      'Content-Type': 'audio/mulaw'
    },
    body: Buffer.from(audioBase64, 'base64')
  });
  const dgData = await dgRes.json();
  const transcript = dgData.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
  console.log(`[VOICE ASR Deepgram ${language}]: "${transcript}"`);
  return transcript;
}
