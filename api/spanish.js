export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=86400');
  const raw = (req.query.text || req.body?.text || "Hola").toString().trim();
  const SPANISH_DICT = {
    "hola":"Hello","gracias":"Thank you","adios":"Goodbye","si":"Yes","no":"No",
    "por favor":"Please","buenos dias":"Good morning","buenas noches":"Good night",
    "como estas":"How are you","estoy bien":"I am fine","te amo":"I love you","donde":"Where"
  };
  const t = raw.toLowerCase().trim();
  let v = SPANISH_DICT[t] || null;
  if(!v){
    try{
      const r = await fetch(`https://nqai.llc/api/translate?text=${encodeURIComponent(raw)}`);
      const j = await r.json();
      v = j.translated || raw;
    }catch(e){ v = raw; }
  }
  return res.json({original:raw, translated:v, provider: SPANISH_DICT[t] ? 'spanish-dict' : 'nllb-200', lang:'spa', instant:true});
}
