const twilio = require('twilio');
module.exports = async (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const bodyDigits = req.body?.Digits ? String(req.body.Digits) : '';
  const queryDigits = req.query?.Digits ? String(req.query.Digits) : '';
  const queryDest = req.query?.dest ? String(req.query.dest) : '';
  const bodyDest = req.body?.dest ? String(req.body.dest) : '';
  const destParam = queryDest || bodyDest || '';
  const digitsRaw = bodyDigits || queryDigits || '';
  const digits = digitsRaw.replace(/\D/g, '');
  const twiml = new VoiceResponse();

  const LANG_MAP = {
    '1': 'es', '2': 'ar', '3': 'vi', '4': 'my', '5': 'zh', '6': 'hi', '7': 'fr', '8': 'ru', '9': 'pt', '0': 'auto',
    '10': 'bn', '11': 'cs', '12': 'da', '13': 'nl', '14': 'fil', '15': 'fi', '16': 'de', '17': 'el', '18': 'hu', '19': 'id', '20': 'it', '21': 'ja', '22': 'ko', '23': 'mr', '24': 'no', '25': 'pl', '26': 'ro', '27': 'sv', '28': 'ta', '29': 'te', '30': 'th', '31': 'tr'
  };

  if (!digits && !destParam) {
    const gather = twiml.gather({ input: 'dtmf', numDigits: 11, finishOnKey: '#', timeout: 12, action: '/api/voice', method: 'POST' });
    gather.say({ voice: 'Polly.Joanna-Neural' }, 'NqAI Super Phone. Thirty one languages ready. Please dial destination number followed by pound. For example, 615-555-0123 pound.');
    twiml.say({ voice: 'Polly.Joanna-Neural' }, 'No input received. Goodbye.');
    res.setHeader('Content-Type', 'text/xml');
    return res.send(twiml.toString());
  }

  if (digits.length >= 10 && !destParam) {
    const cleanDest = digits;
    const gatherLang = twiml.gather({ input: 'dtmf', numDigits: 2, finishOnKey: '#', timeout: 12, action: `/api/voice?dest=${cleanDest}`, method: 'POST' });
    gatherLang.say({ voice: 'Polly.Joanna-Neural' }, `You dialed ${cleanDest.split('').join(' ')}. Now select language. Press 1 for Spanish, 2 for Arabic, 3 for Vietnamese, 4 for Burmese, 5 for Chinese, 6 for Hindi, 7 for French, 8 for Russian, 9 for Portuguese, 0 for auto detect all 31 languages. Then press pound.`);
    twiml.say({ voice: 'Polly.Joanna-Neural' }, 'No language selected, using auto detect.');
    res.setHeader('Content-Type', 'text/xml');
    return res.send(twiml.toString());
  }

  const finalDest = destParam || (digits.length >= 10 ? digits : '');
  let langDigits = '';
  if (destParam && digits) langDigits = digits;
  else if (!destParam && digits.length < 3) langDigits = digits;

  const cleanDestFinal = finalDest.replace(/\D/g, '');
  const targetLang = LANG_MAP[langDigits] || LANG_MAP[langDigits.replace('#','')] || 'auto';

  if (cleanDestFinal.length < 10) {
    twiml.say({ voice: 'Polly.Joanna-Neural' }, 'Invalid destination number. Goodbye.');
    res.setHeader('Content-Type', 'text/xml');
    return res.send(twiml.toString());
  }

  const roomId = `NqAI-W2-${Date.now()}-${cleanDestFinal.slice(-4)}`;
  console.log(`[W2 31 UNLOCK] Dest:${cleanDestFinal} Target:${targetLang} LangDigits:${langDigits} Room:${roomId}`);

  try {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const toNumber = cleanDestFinal.length === 10 ? `+1${cleanDestFinal}` : `+${cleanDestFinal}`;
    await client.calls.create({
      to: toNumber,
      from: '+16152355215',
      url: `https://nqai.llc/api/relay-bot?target=${targetLang}&room=${roomId}&lang=${targetLang}`
    });
  } catch (e) {
    console.error('[W2 31 UNLOCK ERROR]', e.message);
    twiml.say({ voice: 'Polly.Joanna-Neural' }, 'Could not connect to destination. Please try again.');
    res.setHeader('Content-Type', 'text/xml');
    return res.send(twiml.toString());
  }

  twiml.say({ voice: 'Polly.Joanna-Neural' }, `Connecting you to ${cleanDestFinal.split('').join(' ')} with ${targetLang === 'auto' ? 'auto detect 31 languages' : targetLang} translation. Translation session will begin shortly.`);
  const connect = twiml.connect();
  connect.conversationRelay({
    url: `wss://nqai-super-phone.fly.dev/api/relay?target=${targetLang}&room=${roomId}&role=caller`,
    transcriptionProvider: 'Deepgram',
    transcriptionLanguage: 'multi',
    speechModel: 'flux',
    ttsProvider: 'ElevenLabs'
  });

  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml.toString());
};
