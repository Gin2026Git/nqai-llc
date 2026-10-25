// api/conf-status.js - Twilio Conference Status Callback - NqAI LLC
export default async function handler(req, res) {
  console.log('[CONF-STATUS] Callback:', req.body || req.query);
  res.status(200).send('OK');
}
