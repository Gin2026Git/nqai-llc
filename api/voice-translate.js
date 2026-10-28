export default async function handler(req, res) {
res.setHeader('Content-Type', 'text/xml; charset=utf-8');
const digits = req.body?.Digits || req.query?.Digits || '';
const conf = req.body?.conf || req.query?.conf || `NqAI-${Date.now()}`;
if (!digits) {
return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Gather numDigits="12" timeout="15" finishOnKey="#" action="/api/voice-translate" method="POST">
<Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System. Major languages working, rare languages training. Please dial destination number followed by pound.</Say>
</Gather>
<Say voice="Polly.Matthew">No input received. Goodbye.</Say>
<Hangup/>
</Response>`);
}
const cleanDigits = digits.replace(/\D/g, '');
if (cleanDigits.length < 10) {
return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="Polly.Matthew">Invalid number. Goodbye.</Say>
<Hangup/>
</Response>`);
}
try {
const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_PHONE_NUMBER;
const auth = Buffer.from(`${sid}:${token}`).toString('base64');
await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
method: 'POST',
headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
body: new URLSearchParams({ To: `+${cleanDigits.startsWith('1') ? '' : '1'}${cleanDigits}`, From: from, Url: `https://nqai.llc/api/conf-join?conf=${conf}` }).toString()
});
await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`, {
method: 'POST',
headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
body: new URLSearchParams({ To: from, From: from, Url: `https://nqai.llc/api/translator-bot?conf=${conf}` }).toString()
});
} catch (e) { console.error('Outbound error', e); }
return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="Polly.Matthew">Thank you. You dialed ${cleanDigits}. Connecting with live interpreter. You will hear translation automatically.</Say>
<Dial><Conference waitUrl="http://twimlets.com/holdmusic?Bucket=com.twilio.music.ambient" statusCallback="/api/conf-status" statusCallbackEvent="join leave">${conf}</Conference></Dial>
</Response>`);
}
