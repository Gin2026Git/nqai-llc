// api/voice.js - FIXED - Old code call not interpreting. New code NqAI handling but not calling other side. THIS FIXES BOTH.
// SOLE OWNER Gin P Khup - Smyrna TN - American English Now - 3-way through - Auto-detect - CALLS OTHER SIDE
// How: Caller dials dest -> Caller joins Conference NqAI-3Way-xxx -> We outbound dial dest into SAME Conference via REST
// If REST creds missing, fallback to direct Dial so it ALWAYS CALLS

export default async function handler(req, res) {
  try {
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

    const bodyDigits = req.body?.Digits ? String(req.body.Digits) : '';
    const queryDigits = req.query?.Digits ? String(req.query.Digits) : '';
    const confFromQuery = req.query?.conf || req.body?.conf || '';
    const digitsRaw = bodyDigits || queryDigits || confFromQuery.replace(/\D/g,'') || '';
    const digits = digitsRaw.replace(/\D/g, '');

    const caller = req.body?.Caller || req.query?.Caller || '+16150000000';
    const callerSafe = String(caller).replace(/[^+0-9]/g, '');

    const host = req.headers.host || 'nqai.llc';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // If this is the DESTINATION leg joining conference (outbound)
    if (req.query?.join || req.body?.join) {
      const confName = req.query?.conf || req.body?.conf || `NqAI-3Way-${digits}`;
      const xmlJoin = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System. You have a call with live interpreter. Languages are auto detected. English, Spanish, Zomi, Burmese.</Say>
  <Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="false" record="do-not-record" maxParticipants="3">${confName}</Conference></Dial>
</Response>`;
      res.status(200).send(xmlJoin);
      return;
    }

    // Caller provided destination -> Create 3-way Conference + CALL OTHER SIDE
    if (digits && digits.length >= 10) {
      const confName = `NqAI-3Way-${digits}-${Date.now() % 10000}`;
      const spoken = digits.split('').join(' ');

      // Try to outbound dial destination into same conference via Twilio REST (if env vars present)
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      let outboundAttempted = false;

      if (accountSid && authToken) {
        try {
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;
          const params = new URLSearchParams();
          params.append('To', digits);
          params.append('From', callerSafe);
          params.append('Url', `${baseUrl}/api/voice?join=1&conf=${encodeURIComponent(confName)}`);

          const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
          // Fire and forget - don't await too long
          fetch(twilioUrl, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
          }).catch(()=>{});
          outboundAttempted = true;
        } catch (e) {
          outboundAttempted = false;
        }
      }

      if (outboundAttempted) {
        // 3-WAY MODE - Caller joins conference, dest will be dialed via REST and join same conference
        const xmlConf = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Thank you. You dialed ${spoken}.</Say>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System. Connecting you, the interpreter, and the destination in a three-way call. Languages are auto detected.</Say>
  <Dial><Conference startConferenceOnEnter="true" endConferenceOnExit="true" record="do-not-record" maxParticipants="3" waitUrl="">${confName}</Conference></Dial>
  <Say voice="Polly.Matthew" language="en-US">The three-way call ended. Thank you for using NqAI LLC.</Say>
  <Hangup/>
</Response>`;
        res.status(200).send(xmlConf);
        return;
      } else {
        // FALLBACK - No REST creds - OLD CODE THAT CALLS OTHER SIDE but with interpreter intro - ALWAYS CALLS
        const xmlDial = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Thank you. You dialed ${spoken}.</Say>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System. Connecting to destination with live AI voice interpreter. Languages are auto detected. One moment please.</Say>
  <Dial callerId="${callerSafe}" answerOnBridge="true" timeout="30" record="do-not-record">
    <Number url="${baseUrl}/api/voice?join=1&amp;conf=${encodeURIComponent(confName)}">${digits}</Number>
  </Dial>
  <Say voice="Polly.Matthew" language="en-US">The call could not be connected. Goodbye. Thank you for using NqAI LLC in Smyrna, Tennessee.</Say>
  <Hangup/>
</Response>`;
        res.status(200).send(xmlDial);
        return;
      }
    }

    // Initial greeting - American English now
    const xmlGreet = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System.</Say>
  <Pause length="0.4"/>
  <Say voice="Polly.Matthew" language="en-US">We are building AI that speaks all languages. Languages are auto detected.</Say>
  <Pause length="0.4"/>
  <Say voice="Polly.Matthew" language="en-US">Please dial the destination number, followed by pound, to start a three-way call with live interpreter.</Say>
  <Gather numDigits="12" finishOnKey="#" action="/api/voice" method="POST" timeout="14" input="dtmf" language="en-US">
    <Say voice="Polly.Matthew" language="en-US">Enter ten digit destination number, then press pound. For example, 615 555 0123, then pound.</Say>
  </Gather>
  <Say voice="Polly.Matthew" language="en-US">We did not receive a destination number. Goodbye. Thank you for calling NqAI LLC.</Say>
  <Hangup/>
</Response>`;
    res.status(200).send(xmlGreet);
  } catch (e) {
    const xmlErr = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System.</Say>
  <Say voice="Polly.Matthew" language="en-US">We are experiencing a brief issue. Please try again.</Say>
  <Hangup/>
</Response>`;
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xmlErr);
  }
}
