export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Cache-Control','s-maxage=86400');
  const raw=(req.query.text||'Hola').toString().trim();
  const t=raw.toLowerCase().replace(/[.!?]+$/,'').trim();
  const D={
"hola":"Hello","gracias":"Thank you","adios":"Goodbye","si":"Yes","no":"No","por favor":"Please","buenos dias":"Good morning","buenas noches":"Good night","como estas":"How are you","te amo":"I love you",
"mingalaba":"Hello","mingalabar":"Hello","nay kaung la":"How are you","kyay zu tin bar tal":"Thank you","kyay zu":"Thank you","hawt":"Yes","ma hawt bu":"No","ye":"Water","hta min":"Rice","sa pi bi":"Eat","bae ma":"Where","po fla":"Money","sayar":"Doctor","se khan":"Hospital",
"na dam maw":"How are you","ka dam":"I am fine","ka lung dam":"I am happy","ki pa maw":"Where are you going","bang ma":"Where","na min bang":"What is your name","topa":"God","ka it":"I love you","an ne":"Eat","tui":"Water","inn":"House","pa":"Father","nu":"Mother","zomi":"Zomi","khup":"Khup","hoih":"Good","sum":"Money","nasep":"Work","tuni":"Today","zing":"Morning","khat":"One","nih":"Two","thum":"Three","dam lo":"Sick","hong huh":"Help me","pai":"Go","hong pai":"Come","zogam":"Zomi land","a hi":"Yes","hi lo":"No","damdawi inn":"Hospital","lam":"Road","mawtaw":"Car","smyrna":"Smyrna","usa":"USA","america":"America","myanmar":"Myanmar","biakna":"Church"
};
  const v=D[t]||D[raw.toLowerCase()]||raw;
  return res.json({original:raw,translated:v,provider:'dict-v5',lang:'auto',total:Object.keys(D).length});
}
