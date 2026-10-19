// api/translator-bot.js - NqAI Real-time Translator Voice Bot
// Listens, translates via translate.js (groq+dict+ml), speaks into conference

export default async function handler(req,res){
  const host = req.headers.host || 'nqai.llc';
  const confName = req.query.conf || req.body?.conf || 'nqai-room';
  const from = req.query.from || 'eng';
  const to = req.query.to || 'spa';
  const translatedText = req.query.translated || req.body?.translated || '';
  const callerInput = req.query.SpeechResult || req.body?.SpeechResult || '';

  res.setHeader('Content-Type','text/xml');

  // Step 2: If we have speech from human, translate it
  if(callerInput){
    try{
      const r = await fetch(`https://${host}/api/translate`,{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ text: callerInput, from, to, caller: 'translator-bot' })
      });
      const j = await r.json();
      const translated = j.translated || callerInput;

      // Speak translation into conference
      const twiml = `
        <Response>
          <Say voice="Polly.Mia" language="es-MX">${translated.replace(/[<>&]/g,' ')}</Say>
          <Redirect method="POST">https://${host}/api/translator-bot?conf=${encodeURIComponent(confName)}&amp;from=${from}&amp;to=${to}</Redirect>
        </Response>`;
      return res.status(200).send(twiml);
    }catch(e){
      console.log('translator error', e.message);
    }
  }

  // Step 1: If we have pre-translated text (from other flow), just say it
  if(translatedText){
    const twiml = `
      <Response>
        <Say voice="Polly.Mia" language="es-MX">${translatedText.replace(/[<>&]/g,' ')}</Say>
        <Redirect method="POST">https://${host}/api/translator-bot?conf=${encodeURIComponent(confName)}&amp;from=${from}&amp;to=${to}</Redirect>
      </Response>`;
    return res.status(200).send(twiml);
  }

  // Step 0: Join conference and listen loop
  const twiml = `
    <Response>
      <Say voice="Polly.Mia" language="es-MX">Traductor conectado. Listo para traducir.</Say>
      <Dial>
        <Conference 
          beep="false" 
          startConferenceOnEnter="true" 
          endConferenceOnExit="false"
          statusCallback="https://${host}/api/conf-status"
          statusCallbackEvent="join leave"
        >${confName}</Conference>
      </Dial>
      <Gather input="speech" language="en-US" speechTimeout="auto" timeout="3" action="https://${host}/api/translator-bot?conf=${encodeURIComponent(confName)}&amp;from=${from}&amp;to=${to}" method="POST">
        <Say>Listening</Say>
      </Gather>
      <Redirect method="POST">https://${host}/api/translator-bot?conf=${encodeURIComponent(confName)}&amp;from=${from}&amp;to=${to}</Redirect>
    </Response>`;
  
  res.status(200).send(twiml);
}
