const twilio = require('twilio');
module.exports = async (req, res) => {
  const VoiceResponse = twilio.twiml.VoiceResponse;
  const digits = (req.body && req.body.Digits) || req.query.Digits || '';
  const twiml = new VoiceResponse();
  if (!digits) {
    const gather = twiml.gather({input:'dtmf', numDigits:11, finishOnKey:'#', timeout:10, action:'/api/voice', method:'POST'});
    gather.say({voice:'Polly.Joanna-Neural'}, 'NqAI Super Phone. Please dial destination number followed by pound.');
    twiml.say({voice:'Polly.Joanna-Neural'}, 'No input received. Goodbye.');
  } else {
    const clean = digits.replace('#','').replace(/\D/g,'');
    try {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      const toNumber = clean.length===10 ? `+1${clean}` : `+${clean}`;
      await client.calls.create({to: toNumber, from:'+16152355215', url:'https://nqai.llc/api/relay-bot'});
      console.log('W2 dialing', toNumber);
    } catch(e){ console.error('W2 error', e.message); }
    const connect = twiml.connect();
    connect.conversationRelay({url:'wss://nqai-super-phone.fly.dev/api/relay', transcriptionProvider:'Deepgram', transcriptionLanguage:'multi', speechModel:'flux', ttsProvider:'ElevenLabs'});
  }
  res.setHeader('Content-Type','text/xml');
  res.send(twiml.toString());
};
