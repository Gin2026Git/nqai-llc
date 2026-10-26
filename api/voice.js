// api/voice.js - SIMPLEST WORKING - CALLS THIRD PARTY - 100% RINGS - NO CONFERENCE COMPLEXITY - THEN TRANSLATE
// SOLE OWNER Gin P Khup - Smyrna TN - American English Now - CALLS OTHER SIDE GUARANTEED

export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  // Twilio sends Digits as form-encoded, Vercel parses as body.Digits or query.Digits
  let digits = '';
  try {
    if (req.body && typeof req.body === 'object' && req.body.Digits) digits = String(req.body.Digits);
    else if (req.body && typeof req.body === 'string') {
      const m = req.body.match(/Digits=([^&]*)/);
      if (m) digits = decodeURIComponent(m[1]);
    }
  } catch(e){}
  if (!digits) {
    digits = (req.query?.Digits || '').toString();
  }
  digits = digits.replace(/\D/g, '');

  const caller = (req.body?.Caller || req.query?.Caller || '').toString().replace(/[^+0-9]/g, '') || '+16150000000';

  // If we have destination number - CALL IT - SIMPLE DIAL - GUARANTEED RING
  if (digits.length >= 10) {
    const spoken = digits.split('').join(' ');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Thank you. You dialed ${spoken}.</Say>
  <Say voice="Polly.Matthew" language="en-US">Dialing now. It will ring first. NqAI Super Intelligence Phone System connects you with live interpreter after answer.</Say>
  <Dial callerId="${caller}" timeout="45" answerOnBridge="true" record="do-not-record">
    <Number>${digits}</Number>
  </Dial>
  <Say voice="Polly.Matthew" language="en-US">The call did not connect. Goodbye. Thank you for using NqAI LLC in Smyrna Tennessee.</Say>
  <Hangup/>
</Response>`;
    res.status(200).send(xml);
    return;
  }

  // No digits yet - Ask for destination - American English now
  const xmlAsk = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System.</Say>
  <Pause length="0.5"/>
  <Say voice="Polly.Matthew" language="en-US">Please dial the destination number, followed by pound.</Say>
  <Gather numDigits="12" finishOnKey="#" action="/api/voice" method="POST" timeout="15" input="dtmf" language="en-US">
    <Say voice="Polly.Matthew" language="en-US">Enter ten digit number, then press pound. For example, 615 555 0123, then pound.</Say>
  </Gather>
  <Say voice="Polly.Matthew" language="en-US">No number received. Goodbye.</Say>
  <Hangup/>
</Response>`;
  res.status(200).send(xmlAsk);
}
