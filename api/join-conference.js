let LANGS = globalThis.confLangs = globalThis.confLangs || {};

export default async function handler(req, res) {
  const conf = req.query.conf || 'nqai-room';
  const step = req.query.step;
  const speech = req.body.SpeechResult || "";

  if(step === 'detect' && speech) {
    const tr = await fetch(`https://nqai.llc/api/translate?text=${encodeURIComponent(speech)}&from=auto&to=en`).then(r=>r.json());
    LANGS[conf] = LANGS[conf] || [];
    if(!LANGS[conf].includes(tr.from)) LANGS[conf].push(tr.from);
    
    const twiml = `
      <Response>
        <Say voice="${tr.voice}">Connected via NqAI. You will hear translation in your language. Please wait.</Say>
        <Dial><Conference statusCallback="https://nqai.llc/api/conf-status" statusCallbackEvent="join leave start end" beep="false">${conf}</Conference></Dial>
      </Response>`;
    res.setHeader('Content-Type','text/xml');
    return res.send(twiml);
  }

  // FIRST hello when you don't know his language
  const twiml = `
    <Response>
      <Say voice="Polly.Joanna">Hello! Translated call via NqAI.</Say>
      <Say voice="Polly.Mia">¡Hola! Llamada traducida vía NqAI.</Say>
      <Say voice="Polly.Mizuki">こんにちは！翻訳通話です。</Say>
      <Gather input="speech" action="/api/join-conference?conf=${conf}&step=detect" method="POST" language="auto" timeout="5" speechTimeout="auto">
        <Say voice="Polly.Joanna">Please say hello in your language.</Say>
      </Gather>
      <Dial><Conference statusCallback="https://nqai.llc/api/conf-status" statusCallbackEvent="join leave start end" beep="false">${conf}</Conference></Dial>
    </Response>`;
  res.setHeader('Content-Type','text/xml');
  res.send(twiml);
}
