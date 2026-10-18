import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  const p = { ...req.query, ...req.body };
  const from = p.From || 'unknown';
  const body = (p.Body || '').trim();
  const sid = p.MessageSid || Date.now().toString();

  if (body) {
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    const bLower = body.toLowerCase();
    
    let dialect = 'unknown';
    let meaning = 'rare';

    // FINAL DICTIONARY - YOU CONFIRMED YES
    // Thado Kuki: Kei ham = My dialect
    if (bLower.includes('kei ham')) {
      dialect = 'thado-kuki';
      meaning = 'my dialect Thado Kuki';
    } 
    // Zomi/Tedim: Kei pau / Zopau / Tedim pau
    else if (bLower.includes('kei pau') || bLower.includes('zopau') || bLower.includes('tedim pau') || bLower.includes('tedim')) {
      dialect = 'zomi-tedim';
      meaning = 'Zopau/Tedim pau - my language';
    }
    
    // Dam maw? Damdam maw? = How are you? Zomi/Tedim
    if (bLower.includes('damdam maw') || bLower.includes('dam maw')) {
      dialect = 'zomi-tedim';
      meaning = 'How are you? polite Damdam maw?';
    }

    const rec = {
      type: 'sms_record',
      text_original: body,
      dialect_detected: dialect,
      meaning: meaning,
      from_number: from,
      to_number: '+16152355215',
      message_sid: sid,
      timestamp: Date.now(),
      id: id,
      source: 'sms.js-one-brain-final',
      lang: 'tcd',
      voice_soul: 'sms-6152355215'
    };

    try {
      await kv.hset('fixes', { [id]: rec });
    } catch (e) {
      console.error('KV save error', e);
    }
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Damdam maw? Kei pau / Kei ham thu ka ngah ta. Family Vault ah ki save ta - nqai.llc. Lungdam!</Message></Response>`;
  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml);
}
