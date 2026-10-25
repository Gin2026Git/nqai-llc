// api/voice.js - NqAI LLC - SOLE OWNER Gin P Khup - Smyrna TN - 79 lines equivalent
// Greeting: Hi, this is NqAI Super Intelligence Phone System. Please dial the destination number.

export default function handler(req, res) {
  try {
    // HIPAA & Security Headers - Always TwiML
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Parse Digits
    const bodyDigits = req.body && req.body.Digits ? String(req.body.Digits) : '';
    const queryDigits = req.query && req.query.Digits ? String(req.query.Digits) : '';
    const digitsRaw = bodyDigits || queryDigits || '';
    const digits = digitsRaw.replace(/\D/g, '');

    const caller = (req.body && req.body.Caller) || (req.query && req.query.Caller) || '+16150000000';
    const callerSafe = String(caller).replace(/[^+0-9]/g, '');

    // If destination 10+ digits, dial
    if (digits && digits.length >= 10) {
      const spokenDigits = digits.split('').join(' ');
      const xmlDial = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Thank you. You dialed ${spokenDigits}.</Say>
  <Say voice="Polly.Matthew" language="en-US">Connecting to destination with NqAI Super Intelligence live voice interpreter. One moment please.</Say>
  <Pause length="1"/>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System. Building AI that speaks all languages. Connecting now.</Say>
  <Dial callerId="${callerSafe}" answerOnBridge="true" timeout="30" record="do-not-record">
    <Number statusCallbackEvent="initiated ringing answered completed" statusCallback="/api/voice-status" statusCallbackMethod="POST">${digits}</Number>
  </Dial>
  <Say voice="Polly.Matthew" language="en-US">The call could not be connected. Goodbye. Thank you for using NqAI LLC in Smyrna, Tennessee.</Say>
  <Hangup/>
</Response>`;
      res.status(200).send(xmlDial);
      return;
    }

    // Initial greeting
    const xmlGreeting = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System.</Say>
  <Pause length="0.6"/>
  <Say voice="Polly.Matthew" language="en-US">Please dial the destination number, followed by pound.</Say>
  <Gather numDigits="12" finishOnKey="#" action="/api/voice" method="POST" timeout="12" input="dtmf" language="en-US">
    <Say voice="Polly.Matthew" language="en-US">Enter the ten digit destination number, then press pound. For example, 615 555 0123, then pound.</Say>
  </Gather>
  <Say voice="Polly.Matthew" language="en-US">We did not receive a destination number. Goodbye. Thank you for calling NqAI LLC.</Say>
  <Hangup/>
</Response>`;
    res.status(200).send(xmlGreeting);
    return;

  } catch (err) {
    const xmlError = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System.</Say>
  <Say voice="Polly.Matthew" language="en-US">We are experiencing a brief issue. Please try again. Thank you for calling NqAI LLC.</Say>
  <Hangup/>
</Response>`;
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xmlError);
  }
}
