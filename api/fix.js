// api/fix.js - Family Vault PERSISTENT with Upstash Redis
import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const all = await kv.hgetall('fixes') || {};
      const keys = Object.keys(all);
      // Sort newest first
      const records = Object.values(all).sort((a,b)=> (b.timestamp||0)-(a.timestamp||0)).slice(0,50);
      return res.json({ 
        fixes: all, 
        total: keys.length, 
        records,
        source: 'upstash-kv-persistent',
        db: 'nqai-fixes'
      });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const id = Date.now().toString() + '-' + Math.random().toString(36).slice(2,7);
      const record = {
        ...body,
        timestamp: Date.now(),
        id
      };
      await kv.hset('fixes', { [id]: record });
      const total = await kv.hlen('fixes');
      return res.json({ ok: true, id, total, saved: record });
    }

    return res.status(405).json({ error: 'Use GET or POST' });
  } catch (e) {
    return res.status(500).json({ error: e.message, where: 'fix.js kv' });
  }
}
