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
    let meaning = body;
    let type = 'sms_record';
    let term = body;

    // TEACH MODE: "Damdam maw = How are you in Zomi" or "Damdam maw is How are you"
    if (body.includes('=')) {
      const parts = body.split('=');
      term = parts[0].trim();
      meaning = parts.slice(1).join('=').trim();
      type = 'teach_record';
    } else if (bLower.includes(' means ') || bLower.includes(' this is ') || bLower.includes(' is ')) {
      let splitWord = bLower.includes(' means ') ? 'means' : bLower.includes(' this is ') ? 'this is' : 'is';
      const idx = bLower.indexOf(` ${splitWord} `);
      if (idx > 2) {
        term = body.substring(0, idx).trim();
        meaning = body.substring(idx + splitWord.length + 2).trim();
        type = 'teach_record';
      }
    }

    // Dialect detect from TERM
    const tLower = term.toLowerCase();
    if (tLower.includes('kei ham')) dialect = 'thado-kuki';
    else if (tLower.includes('kei pau') || tLower.includes('zopau') || tLower.includes('tedim') || tLower.includes('dam')) dialect = 'zomi-tedim';
    if (bLower.includes('damdam') || bLower.includes('dam maw')) dialect = 'zomi-tedim';

    const rec = {
      type: type,
      text_original: term,
      full_input: body,
      dialect_detected: dialect,
      meaning: meaning,
      from_number: from,
      to_number: '+16152355215',
      message_sid: sid,
      timestamp: Date.now(),
      id: id,
      source: type === 'teach_record' ? 'teach-sms' : 'sms.js-one-brain-final',
      lang: 'tcd',
      teach: type === 'teach_record'
    };

    try { await kv.hset('fixes', { [id]: rec }); } catch (e) { console.error(e); }
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Saved! Damdam maw? Na thu ka ngah ta. Term saved to Family Vault nqai.llc/api/fix?pretty=1 - Lungdam!</Message></Response>`;
  res.setHeader('Content-Type', 'text/xml');
  return res.status(200).send(twiml);
}
