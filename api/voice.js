module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/xml');
  const transcription = (req.body?.TranscriptionText || req.query?.text || "").toString();
  
  if(transcription){
    // After transcription - Translate via your new translate.js logic
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="alice">You said: ${transcription}. Translating...</Say>
<Redirect method="GET">/api/translate?text=${encodeURIComponent(transcription)}&amp;voice=1</Redirect>
</Response>`);
  } else {
    res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="alice">Thanks for calling NqAI LLC at 615-235-5215! Your AI interpreter is ready! Type any language, auto-detected! Speak after beep, 60 seconds.</Say>
<Record maxlength="60" action="/api/voice" transcribe="true" transcribeCallback="/api/voice" method="POST" />
<Say voice="alice">No speech detected. Call again. HQ 615-235-5215. Bye!</Say>
</Response>`);
  }
};
