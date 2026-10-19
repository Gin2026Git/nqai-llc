export default async function handler(req, res) {
  const conf = req.query.conf || 'nqai-room';
  const speech = req.body.SpeechResult || "";

  if(!speech) {
    // Listening loop - any language
    const twiml = `
      <Response>
        <Gather input="speech" action="/api/translator-bot?conf=${conf}" method="POST" language="auto" speechTimeout="auto" speechModel="phone_call">
          <Say voice="Polly.Joanna">NqAI listening, any language...</Say>
        </Gather>
        <Redirect>/api/translator-bot?conf=${conf}</Redirect>
      </Response>`;
    res.setHeader('Content-Type','text/xml');
    return res.send(twiml);
  }

  // Detect + Translate to other side
  const tr = await fetch(`https://nqai.llc/api/translate?text=${encodeURIComponent(speech)}&from=auto&to=auto`).then(r=>r.json());
  
  const twiml = `
    <Response>
      <Say voice="${tr.voice || 'Polly.Joanna'}" language="${tr.to}">${tr.translated.replace(/&/g,'&amp;')}</Say>
      <Redirect>/api/translator-bot?conf=${conf}</Redirect>
    </Response>`;
  res.setHeader('Content-Type','text/xml');
  res.send(twiml);
}
