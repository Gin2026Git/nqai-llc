export default async function handler(req, res) {
  const step = req.query.step;
  if(step === 'got_number') {
    let num = (req.body.Digits || req.body.SpeechResult || "").replace(/\D/g,"");
    const callerId = req.body.From || "";
    console.log("CALLER:", callerId, "TO:", num);
    
    if(num.length<10) {
      const twiml=`<Response><Say>Number too short. Try again.</Say><Redirect>/api/voice</Redirect></Response>`;
      res.setHeader('Content-Type','text/xml');
      return res.send(twiml);
    }
    if(num.length===10) num="1"+num;
    const toNum="+"+num;
    const conf=`nqai-${Date.now()}`;
    const sid=process.env.TWILIO_ACCOUNT_SID, tok=process.env.TWILIO_AUTH_TOKEN, twilioNum=process.env.TWILIO_PHONE_NUMBER;
    const auth='Basic '+Buffer.from(sid+':'+tok).toString('base64');
    
    // 1. SEND SMS FIRST! So friend knows who is calling!
    try {
      const smsBody = `NqAI Call: You have an incoming translated call from ${callerId}. Please answer this call from ${twilioNum}. Your conversation will be translated in real-time! - nqai.llc`;
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,{
        method:'POST',
        headers:{'Authorization':auth,'Content-Type':'application/x-www-form-urlencoded'},
        body:new URLSearchParams({To:toNum, From:twilioNum, Body:smsBody})
      });
      console.log("SMS SENT to", toNum);
    } catch(e){ console.log("SMS FAILED:", e.message); }

    // 2. Then CALL friend
    const joinUrl = `https://nqai.llc/api/join-conference?conf=${conf}&caller=${encodeURIComponent(callerId)}`;
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Calls.json`,{
      method:'POST',
      headers:{'Authorization':auth,'Content-Type':'application/x-www-form-urlencoded'},
      body:new URLSearchParams({To:toNum, From:twilioNum, Url:joinUrl})
    });
    
    const twiml=`<Response><Say>We sent a text and calling ${toNum}, please wait.</Say><Dial><Conference statusCallback="https://nqai.llc/api/conf-status" statusCallbackEvent="join leave start end" beep="false">${conf}</Conference></Dial></Response>`;
    res.setHeader('Content-Type','text/xml');
    return res.send(twiml);
  }
  const twiml=`<Response><Gather input="dtmf speech" action="/api/voice?step=got_number" method="POST" timeout="20" numDigits="15" finishOnKey="#" speechTimeout="auto"><Say>Welcome to NqAI. Type friend's number then press pound.</Say></Gather><Redirect>/api/voice</Redirect></Response>`;
  res.setHeader('Content-Type','text/xml');
  res.send(twiml);
}
