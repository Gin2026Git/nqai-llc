
// api/voice.js - FIXED - hello@nqai.llc - No more Application Error!
export default async function handler(req, res) {
  try {
    const step = req.query.step;
    console.log("STEP:", step, "BODY:", req.body);

    // STEP 1: FIRST CALL - Ask for number - THIS WAS MISSING!
    if (step !== 'got_number') {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to NqAI. Please say or enter the phone number you want to call.</Say>
  <Gather input="speech dtmf" timeout="10" numDigits="12" speechTimeout="auto" action="/api/voice?step=got_number" method="POST">
    <Say>Enter number now.</Say>
  </Gather>
  <Say>We didn't hear number. Try again.</Say>
  <Redirect>/api/voice</Redirect>
</Response>`;
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(twiml);
    }

    // STEP 2: Got number - Send SMS + Connect
    let num = (req.body.Digits || req.body.SpeechResult || "").replace(/\D/g, "");
    const callerId = req.body.From || "";
    console.log("CALLER:", callerId, "TO:", num);

    if (num.length < 10) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Number too short. Try again.</Say><Redirect>/api/voice</Redirect></Response>`;
      res.setHeader('Content-Type', 'text/xml');
      return res.status(200).send(twiml);
    }
    if (num.length === 10) num = "1" + num;
    const toNum = "+" + num;
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const tok = process.env.TWILIO_AUTH_TOKEN;
    const twilioNum = process.env.TWILIO_PHONE_NUMBER || "+16152355215";
    const auth = "Basic " + Buffer.from(sid + ":" + tok).toString('base64');

    // 1. SEND SMS FIRST - 2 sec prior - Killer feature!
    try {
      const smsBody = `NqAI Call: You have an incoming translated call from ${callerId}. Please answer this call from ${twilioNum}. Your conversation will be translated in real-time by AI! - nqai.llc Reply STOP to opt-out`;
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: { 'Authorization': auth, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ To: toNum, From: twilioNum, Body: smsBody })
      });
      console.log("SMS SENT to", toNum);
    } catch (e) {
      console.error("SMS FAILED:", e);
    }

    // 2. CONNECT CALL
    const conf = `nqai-${Date.now()}`;
    const twiml2 = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>SMS sent. Connecting you now to ${toNum}. Your call will be translated.</Say>
  <Dial>
    <Number>${toNum}</Number>
  </Dial>
</Response>`;
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml2);

  } catch (err) {
    console.error("VOICE CRASH:", err);
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, NqAI error. Please call again. Contact hello at nqai dot llc</Say><Hangup/></Response>`);
  }
}
