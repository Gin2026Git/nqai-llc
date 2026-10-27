export default function handler(req,res){
res.setHeader('Content-Type','text/xml; charset=utf-8');
const conf = req.query.conf || req.body?.conf || 'NqAI-Room';
const text = req.query.text || req.body?.text || 'Hola, prueba de traduccion funcionando';
const safe = String(text).replace(/[<>&]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));
return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="Polly.Miguel" language="es-ES">${safe}</Say>
<Dial><Conference maxParticipants="4" startConferenceOnEnter="true">${conf}</Conference></Dial>
</Response>`);
}
