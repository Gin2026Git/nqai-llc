// api/sms.js - ULTRA SIMPLE TEST - hello@nqai.llc
export default function handler(req, res) {
  const from = req.body.From || "friend";
  const body = (req.body.Body || "").trim();
  console.log("SMS TEST IN:", from, body);

  let reply = "Hello from NqAI! You said: " + body.substring(0,100) + " - FREE 1/5 - nqai.llc STOP to opt-out";
  
  // If contains "=" -> Family Vault
  if (body.includes("=")) {
    reply = "Saved! Lungdam! " + body.substring(0,100) + " saved to Family Vault! FREE 1/5 - nqai.llc";
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${reply}</Message>
</Response>`;

  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml);
}
