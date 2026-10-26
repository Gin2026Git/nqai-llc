export default async function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  const conf = req.query.conf || req.body?.conf || 'NqAI-Room';
  const speech = req.body?.SpeechResult || '';

  if (!speech) {
    return res.send(`
<Response>
  <Dial><Conference>${conf}</Conference></Dial>
  <Gather input="speech" language="auto" speechModel="phone_call" speechTimeout="auto" timeout="5" action="/api/translator-bot?conf=${conf}" method="POST">
    <Say voice="Polly.Matthew">Translator bot ready.</Say>
  </Gather>
  <Redirect>/api/translator-bot?conf=${conf}</Redirect>
</Response>`.trim());
  }

  let translated = speech;
  try {
    const key = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (key) {
      const r = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: speech, target: 'es', format: 'text' })
      });
      const j = await r.json();
      translated = j.data?.translations?.[0]?.translatedText || speech;
    }
  } catch (e) { console.error(e); }

  return res.send(`
<Response>
  <Say voice="Polly.Matthew" language="es-ES">${translated}</Say>
  <Redirect>/api/translator-bot?conf=${conf}</Redirect>
</Response>`.trim());
}
