import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const record = req.body;
      const id = record.id || Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      record.id = id;
      if (!record.timestamp) record.timestamp = Date.now();
      await kv.hset('fixes', { [id]: record });
      const allKeys = await kv.hkeys('fixes');
      return res.status(200).json({ ok: true, id, total: allKeys.length, saved: record });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  try {
    const data = await kv.hgetall('fixes');
    const keys = await kv.hkeys('fixes');
    const total = keys ? keys.length : 0;
    const allRecords = Object.values(data || {});
    const sorted = allRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, 50);

    // Pretty HTML view for you
    if (req.query.pretty === '1' || req.headers.accept?.includes('text/html')) {
      let html = `<html><head><meta charset="utf-8"><title>NqAI Family Vault</title><style>body{font-family:system-ui;padding:20px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#111;color:#fff}tr:nth-child(even){background:#f5f5f5}.tag{background:#e0f2ff;padding:2px 6px;border-radius:4px;font-size:12px}</style></head><body>`;
      html += `<h1>NqAI Family Vault - Total: ${total}</h1><p><a href="/api/fix?pretty=0">View JSON</a> | <a href="/api/fix?pretty=1">View Table</a></p>`;
      html += `<table><tr><th>Time</th><th>Type</th><th>Text Original</th><th>Dialect Detected</th><th>Meaning</th><th>From</th></tr>`;
      for (const r of sorted) {
        const time = r.timestamp ? new Date(r.timestamp).toLocaleString() : '';
        html += `<tr><td>${time}</td><td><span class="tag">${r.type || ''}</span></td><td><b>${(r.text_original || '').toString().substring(0,100)}</b></td><td>${r.dialect_detected || r.dialect || ''}</td><td>${r.meaning || ''}</td><td>${(r.from_number || '').toString().slice(-4)}</td></tr>`;
      }
      html += `</table><p>Source: upstash-kv-persistent | Index: nqai-fixes</p></body></html>`;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    return res.status(200).json({ fixes: data, total, recent: sorted, source: 'upstash-kv-persistent', index: 'nqai-fixes' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}
