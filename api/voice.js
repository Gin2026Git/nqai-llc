// api/voice.js - FIXED FOR TWILIO - Returns TwiML, not JSON - NqAI 3-WAY
// SOLE OWNER: Gin P Khup - Smyrna, TN - Fixes "Application Error"
// MUST return valid XML for Twilio, never JSON on voice webhook

import twilio from 'twilio';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  console.log('[VOICE] Twilio webhook hit - returning TwiML');

  try {
    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    // Get params safely - Twilio sends form-encoded
    let body = '';
    if (req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = Buffer.concat(chunks).toString();
      console.log('[VOICE] Body:', body.substring(0,200));
    }

    const CallSid = req.body?.CallSid || 'unknown';
    const ConferenceSid = req.body?.ConferenceSid || CallSid;

    // Fix VERCEL_URL - may be undefined, use host header
    const host = req.headers.host || process.env.VERCEL_URL || 'nqai-llc.vercel.app';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${protocol}://${host}`;
    
    console.log(`[VOICE 3-WAY] Call: ${CallSid} Host: ${host} BaseUrl: ${baseUrl}`);

    // 1. Welcome message - ensures TwiML always valid
    response.say({ voice: 'Polly.Miguel', language: 'es-ES' }, 'Bienvenido a NqAI, conectando interprete. Welcome to NqAI, connecting interpreter.');

    // 2. Join conference - main 3-way
    const dial = response.dial();
    dial.conference({
      statusCallback: `${baseUrl}/api/conf-status`,
      statusCallbackEvent: 'start end join leave',
      startConferenceOnEnter: true,
      endConferenceOnExit: false,
    }, `NqAI-${ConferenceSid || CallSid}`);

    // 3. Start Media Stream for real-time translation - use wss
    // Comment out if translator-bot not deployed yet - this can cause app error if wss endpoint missing
    try {
      const streamUrl = baseUrl.replace('https://', 'wss://').replace('http://', 'ws://') + '/api/translator-bot';
      console.log(`[VOICE] Stream URL: ${streamUrl}`);
      
      // Only add stream if translator-bot exists - for now comment to fix app error
      // response.connect().stream({
      //   url: streamUrl,
      //   track: 'inbound_track',
      // });
      
      // For debugging - just conference for now - no stream
      console.log('[VOICE] Skipping media stream for now - conference only - fixes app error');
    } catch (e) {
      console.log('[VOICE] Stream setup error, continuing with conference only:', e.message);
    }

    res.setHeader('Content-Type', 'text/xml');
    const twiml = response.toString();
    console.log('[VOICE] TwiML:', twiml);
    return res.status(200).send(twiml);

  } catch (err) {
    console.error('[VOICE ERROR - Application Error cause]', err);
    // Fallback TwiML - ALWAYS return valid XML even on error - fixes Twilio Application Error
    const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Miguel" language="es-ES">Error en NqAI, pero conectado. Error in NqAI, but connected.</Say>
  <Dial><Conference>NqAI-fallback</Conference></Dial>
</Response>`;
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(fallback);
  }
}
