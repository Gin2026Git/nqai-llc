export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml');
  const conf = req.query.conf || req.body?.conf || 'NqAI-Room';
  res.send(`
<Response>
  <Say voice="Polly.Matthew">Connecting you to NqAI Super Phone. Please wait for interpreter.</Say>
  <Dial><Conference waitUrl="http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient">${conf}</Conference></Dial>
</Response>`.trim());
}
