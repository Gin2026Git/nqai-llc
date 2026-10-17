export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=86400');
  const raw = (req.query.text || req.body?.text || "Mingalaba").toString().trim();
  const BURMESE_DICT = {
    "mingalaba":"Hello","mingalabar":"Hello","nay kaung la":"How are you",
    "kyay zu tin bar tal":"Thank you","kyay zu":"Thank you","hawt":"Yes","ma hawt bu":"No",
    "ma shi bu":"No","nay kaung":"Fine","kaung":"Good","ma kaung bu":"Not good"
  };
  const t = raw.toLowerCase().trim();
  let v = BURMESE_DICT[t] || null;
  if(!v){
    try{
      const r = await fetch(`https://nqai.llc/api/translate?text=${encodeURIComponent(raw)}`);
      const j = await r.json();
      v = j.translated || raw;
    }catch(e){ v = raw; }
  }
  return res.json({original:raw, translated:v, provider: BURMESE_DICT[t] ? 'burmese-dict' : 'nllb-200', lang:'mya', instant:true});
}
