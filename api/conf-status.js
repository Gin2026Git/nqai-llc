// api/conf-status.js - NqAI 3-way Real-time Translator Bot
// When 2 humans join conference, auto-dials AI translator as 3rd participant
// Translator listens -> calls translate.js (now working hola) -> speaks Spanish

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,OPTIONS');
  if(req.method==='OPTIONS') return res.status(200).end();

  const body = typeof req.body === 'string' ? (()=>{try{return JSON.parse(req.body)}catch{return {}})() : (req.body || {});
  const data = { ...req.query, ...body };
  
  const event = data.StatusCallbackEvent || data.CallStatus || 'participant-join';
  const confSid = data.ConferenceSid || '';
  const confName = data.FriendlyName || data.ConferenceName || 'nqai-room';
  const callSid = data.CallSid || '';
  const host = req.headers.host || 'nqai.llc';

  console.log('conf-status:', event, confName, confSid);

  // 3-way logic: When 2nd participant joins, dial translator bot
  if(event === 'participant-join' || event === 'conference-start' || event === 'participant-join-conference'){
    try{
      if(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && confSid){
        const twilio = await import('twilio');
        const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        
        // Get participant count
        const participants = await client.conferences(confSid).participants.list();
        console.log('participants:', participants.length);

        // When 2 humans in room, add translator as 3rd
        if(participants.length >= 2){
          // Check if translator already in conference
          const hasTranslator = participants.some(p => p.label === 'translator');
          if(!hasTranslator){
            console.log('Adding translator bot to', confName);
            
            // Dial translator bot TwiML
            await client.conferences(confName).participants.create({
              label: 'translator',
              from: process.env.TWILIO_PHONE_NUMBER,
              to: process.env.TWILIO_PHONE_NUMBER,
              earlyMedia: true,
              beep: false,
              endConferenceOnExit: false,
              statusCallback: `https://${host}/api/conf-status`,
              statusCallbackEvent: ['join','leave'],
              // This URL is the translator bot brain
              conferenceStatusCallback: `https://${host}/api/translator-bot?conf=${encodeURIComponent(confName)}&from=eng&to=spa`
            }).catch(async (err) => {
              console.log('conference create failed, trying calls.create', err.message);
              // Fallback: create a call that joins conference via TwiML
              await client.calls.create({
                from: process.env.TWILIO_PHONE_NUMBER,
                to: process.env.TWILIO_PHONE_NUMBER,
                url: `https://${host}/api/translator-bot?conf=${encodeURIComponent(confName)}&from=eng&to=spa`,
                method: 'POST',
                statusCallback: `https://${host}/api/conf-status`,
                statusCallbackEvent: ['initiated','ringing','answered','completed']
              });
            });
          }
        }
      }
    }catch(e){
      console.log('conf-status dial error:', e.message);
    }
  }

  // Log event to /api/fix for ML self-learning
  try{
    await fetch(`https://${host}/api/fix`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        type: 'conf_event',
        event,
        confName,
        confSid,
        callSid,
        timestamp: new Date().toISOString(),
        source: 'conf-status.js-3way-bot'
      })
    });
  }catch{}

  res.status(200).send('ok');
}
