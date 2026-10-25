// api/voice-transcribe.js - NEW ENDPOINT - Deepgram ALL LANGS - Returns JSON (not Twilio voice webhook)
// SOLE OWNER: Gin P Khup - For internal use by translator-bot, not direct Twilio webhook
// This fixes Twilio Application Error by separating TwiML (voice.js) and JSON (voice-transcribe.js)

export const config = { api: { bodyParser: false } };

const DEEPGRAM_LANG_MAP = {
  'es': 'es', 'en': 'en', 'my': 'my', 'zom': 'my',
  'fr': 'fr', 'de': 'de', 'pt': 'pt', 'it': 'it',
  'ja': 'ja', 'ko': 'ko', 'zh': 'zh', 'ar': 'ar',
  'auto': null
};

export default async function handler(req, res) {
  const { lang = 'auto' } = req.query;
  const targetLang = lang.toLowerCase();
  
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const audioBuffer = Buffer.concat(chunks);
  
  if (!audioBuffer.length) {
    return res.status(400).json({ error: 'No audio', transcript: '' });
  }

  try {
    let transcript = '';
    let detectedLang = targetLang;
    
    if (process.env.DEEPGRAM_API_KEY) {
      const deepgramLang = DEEPGRAM_LANG_MAP[targetLang] || undefined;
      const usePhonecall = ['es','en'].includes(targetLang) || targetLang === 'auto';
      const model = usePhonecall ? 'nova-2-phonecall' : 'nova-3';
      
      const url = new URL('https://api.deepgram.com/v1/listen');
      url.searchParams.set('model', model);
      url.searchParams.set('encoding', 'mulaw');
      url.searchParams.set('sample_rate', '8000');
      url.searchParams.set('smart_format', 'true');
      if (deepgramLang) url.searchParams.set('language', deepgramLang);
      else url.searchParams.set('detect_language', 'true');
      if (model === 'nova-2-phonecall') url.searchParams.set('numerals', 'true');
      
      const dgRes = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/mulaw'
        },
        body: audioBuffer
      });
      
      const dgData = await dgRes.json();
      transcript = dgData.results?.channels?.[0]?.alternatives?.[0]?.transcript || '';
      detectedLang = dgData.results?.channels?.[0]?.detected_language || targetLang;
      
      console.log(`[VOICE-TRANSCRIBE ALL-LANGS] Deepgram ${model} (${detectedLang}): "${transcript}"`);
    }

    return res.status(200).json({ 
      transcript, 
      detectedLang,
      targetLang,
      modelUsed: 'deepgram',
      supportsAllLangs: true
    });
    
  } catch (err) {
    console.error('[VOICE-TRANSCRIBE ERROR]', err);
    return res.status(500).json({ error: err.message, transcript: '' });
  }
}
