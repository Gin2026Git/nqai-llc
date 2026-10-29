module.exports = (req, res) => {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <ConversationRelay url="wss://nqai-super-phone.fly.dev/api/relay" transcriptionProvider="Deepgram" transcriptionLanguage="multi" speechModel="flux" ttsProvider="ElevenLabs" />
  </Connect>
</Response>`;
  res.setHeader('Content-Type','text/xml');
  res.send(twiml);
};
