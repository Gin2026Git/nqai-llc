export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=86400');
  const raw = (req.query.text || req.body?.text || "Ka dam").toString().trim();
  const ZOMI_DICT = {
    "ka dam":"I am fine","ka lung dam":"I am happy","na dam maw":"How are you",
    "bang ma":"Where","na min bang":"What is your name","ki pa maw":"Where are you going",
    "ka pa maw":"Where are you going","hawt":"Yes","ma hawt bu":"No","ki ngai":"I miss you"
  };
  const t = raw.toLowerCase().trim();
  let v = ZOMI_DICT[t] || null;
  if(!v){
    try{
      const r = await fetch(`https://nqai.llc/api/translate?text=${encodeURIComponent(raw)}`);
      const j = await r.json();
      v = j.translated || raw;
    }catch(e){ v = raw; }
  }
  return res.json({original:raw, translated:v, provider: ZOMI_DICT[t] ? 'zomi-dict' : 'nllb-200', lang:'zom', instant:true});
}
