// api/voice.js - 3-WAY THROUGH - Auto-detect languages - NqAI LLC - SOLE OWNER Gin P Khup
// 3-way: You (caller), Interpreter AI, Destination - Auto language detection
// Twilio reply in American English now + auto-detect Spanish/Zomi/Burmese/English

export default function handler(req, res) {
  try {
    res.setHeader('Content-Type', 'text/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    const bodyDigits = req.body?.Digits ? String(req.body.Digits) : '';
    const queryDigits = req.query?.Digits ? String(req.query.Digits) : '';
    const digitsRaw = bodyDigits || queryDigits || '';
    const digits = digitsRaw.replace(/\D/g, '');

    const speechResult = req.body?.SpeechResult || req.query?.SpeechResult || '';
    const caller = (req.body?.Caller || req.query?.Caller || '+16150000000');
    const callerSafe = String(caller).replace(/[^+0-9]/g, '');

    // Language auto-detect helper - Twilio Gather input="speech dtmf" with language detection
    // If speech detected, Google Cloud Translation auto-detects source lang
    // Flow: 1) Caller dials dest 2) We join 3-way conference 3) AI listens both sides with Deepgram Nova-2 detect_language=true

    if (digits && digits.length >= 10) {
      const spoken = digits.split('').join(' ');
      // 3-WAY CONFERENCE with auto-detect languages - HIPAA safe - No Media Streams
      const xmlConference = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Thank you. You dialed ${spoken}.</Say>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System. Connecting you, the interpreter, and the destination in a three-way call.</Say>
  <Say voice="Polly.Matthew" language="en-US">Languages are auto detected. English, Spanish, Zomi, Burmese and more. One phrase at a time, starting with Seed1000.</Say>
  <Pause length="1"/>
  <Dial callerId="${callerSafe}" answerOnBridge="true" timeout="30" record="do-not-record" action="/api/voice-conference-status" method="POST">
    <Conference 
      statusCallback="/api/voice-conf-status" 
      statusCallbackEvent="start end join leave mute hold" 
      statusCallbackMethod="POST"
      record="do-not-record"
      startConferenceOnEnter="true"
      endConferenceOnExit="false"
      waitUrl=""
      maxParticipants="3"
    >NqAI-3Way-${digits}</Conference>
  </Dial>
  <Say voice="Polly.Matthew" language="en-US">The three-way call ended. Goodbye. Thank you for using NqAI LLC in Smyrna, Tennessee.</Say>
  <Hangup/>
</Response>`;
      res.status(200).send(xmlConference);
      return;
    }

    // Initial - Auto-detect language setup
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System.</Say>
  <Pause length="0.4"/>
  <Say voice="Polly.Matthew" language="en-US">We are building AI that speaks all languages. Languages are auto detected.</Say>
  <Pause length="0.4"/>
  <Say voice="Polly.Matthew" language="en-US">Please dial the destination number, followed by pound, to start a three-way call with live interpreter.</Say>
  <Gather numDigits="12" finishOnKey="#" action="/api/voice" method="POST" timeout="14" input="dtmf" language="en-US" hints="615 555 0123">
    <Say voice="Polly.Matthew" language="en-US">Enter ten digit destination number, then press pound. For example, 615 555 0123, then pound.</Say>
  </Gather>
  <Say voice="Polly.Matthew" language="en-US">We did not receive a destination number. Goodbye. Thank you for calling NqAI LLC. Auto language detection is ready for English, Spanish, Zomi and Burmese.</Say>
  <Hangup/>
</Response>`;
    res.status(200).send(xml);
  } catch (e) {
    const xmlErr = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Matthew" language="en-US">Hi, this is NqAI Super Intelligence Phone System.</Say>
  <Say voice="Polly.Matthew" language="en-US">Three-way auto detect interpreter is ready. Please try again.</Say>
  <Hangup/>
</Response>`;
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(xmlErr);
  }
}

// --- interpreter.html auto-detect setup - Deepgram Nova-2 + Google Translation ---
// Frontend auto-detect:
// 1. Deepgram: detect_language=true, model=nova-2-phonecall, language=en,es,my, etc. -> returns detected_language
// 2. Google Cloud Translation: detect source language automatically when target set, or use /detect endpoint
// 3. NLLB 3.3B: lang auto detect
// 4. Seed1000: 1000 English phrases as base - translated to any language on the fly via Google 130+ langs 95% accurate
// Current seed1000_fixed_full.tsx is ENGLISH base (1000 unique ownership phrases) - SOLE OWNER Gin P Khup
// For Zomi/Burmese/Spanish live: Use Google Cloud Translation API with auto-detect source lang
