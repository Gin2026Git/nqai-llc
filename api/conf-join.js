export default function handler(req,res){
res.setHeader('Content-Type','text/xml; charset=utf-8');
const conf=req.query.conf||req.body?.conf||'NqAI-Room';
return res.status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
<Say voice="Polly.Matthew">Connecting you to NqAI Super Phone. Please wait for interpreter.</Say>
<Dial><Conference maxParticipants="4" startConferenceOnEnter="true">${conf}</Conference></Dial>
</Response>`);
}
