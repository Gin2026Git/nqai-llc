// translator-bot.js - PRIMARY - 3-way ConferenceRelay - NqAI LLC SOLE OWNER Gin P Khup
export default function handler(req, res) {
  const wssUrl = "wss://nqai-super-phone.fly.dev/api/relay";
  const twiml = `
    <Response>
      <Connect>
        <ConversationRelay url="${wssUrl}" transcriptionProvider="Deepgram" transcriptionLanguage="multi" speechModel="flux" ttsProvider="ElevenLabs" />
      </Connect>
    </Response>
  `;
  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(twiml.trim());
}
