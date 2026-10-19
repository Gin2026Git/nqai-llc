export default async function handler(req, res) {
  const step = req.query.step;
  if(step === 'got_number') {
    let num = (req.body.Digits || req.body.SpeechResult || "").replace(/\D/g,"");
    if(num.length===10) num="1"+num;
    num="+"+num;
    const conf=`nqai-${Date.now()}`;
    const sid=process.env.TWILIO_ACCOUNT_SID, tok=process.env.TWILIO_AUTH_TOKEN, from=process.env.TWILIO_PHONE_NUMBER;
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`,{
      method:'POST',
      headers:{'Authorization':'Basic '+Buffer.from(sid+':'+tok).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({To:num, From:from, Url:`https://nqai.llc/api/join-conference?conf=${conf}`})
    });
    const twiml=`<Response><Say>Calling your friend and detecting his language, please wait.</Say><Dial><Conference statusCallback="https://nqai.llc/api/conf-status" statusCallbackEvent="join leave start end" beep="false">${conf}</Conference></Dial></Response>`;
    res.setHeader('Content-Type','text/xml');
    return res.send(twiml);
  }
  const twiml=`<Response><Gather input="dtmf speech" action="/api/voice?step=got_number" method="POST" language="en-US"><Say>Welcome to NqAI. Say or type friend's number.</Say></Gather></Response>`;
  res.setHeader('Content-Type','text/xml');
  res.send(twiml);
}
