module.exports = (req, res) => {
  const target = (req.query.target || req.query.lang || 'es').toLowerCase();
  const room = (req.query.room || `NqAI-${Date.now()}`).replace(/[^a-zA-Z0-9-_]/g,'');
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna-Neural">Connecting to NqAI translation with ${target === 'auto' ? 'auto detect 31 languages' : target}. Please wait.</Say>
  <Connect>
    <ConversationRelay url="wss://nqai-super-phone.fly.dev/api/relay?target=${target}&amp;room=${room}&amp;role=callee" transcriptionProvider="Deepgram" transcriptionLanguage="multi" speechModel="flux" ttsProvider="ElevenLabs" />
  </Connect>
</Response>`;
  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml);
};
