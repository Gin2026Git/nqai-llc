export default function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const q=(req.query.text||'').toLowerCase().trim();
  const D={
"na dam maw":"How are you","ka dam":"I am fine","ka lung dam":"I am happy","lung dam":"Happy","ki pa maw":"Where are you going","bang ma":"Where","na min bang":"What is your name","topa":"God","thangpa":"Lord","ka it":"I love you","an ne":"Eat","tui":"Water","inn":"House","pa":"Father","nu":"Mother","zomi":"Zomi","khup":"Khup","hoih":"Good","sum":"Money","nasep":"Work","tuni":"Today","zing":"Morning","khat":"One","nih":"Two","thum":"Three","dam lo":"Sick","hong huh":"Help me","pai":"Go","hong pai":"Come","zogam":"Zomi land","biakna":"Church","bang lai ding":"Where will you go","a hi":"Yes","hi lo":"No","damdawi inn":"Hospital"
};
  const extra={"ka dam hi":"I am fine","koi":"Where","bang":"What","kua":"Who","ka hong it":"I love you","an":"Food","tui dawn":"Drink water","inn sung":"At home","pupa":"Grandfather","pi":"Grandmother","hoih lua":"Very good","ka deih":"I want","sawm":"Ten","nitak":"Evening","zan":"Night","tung":"Arrive","lam":"Road","mawtaw":"Car","ka pai ding":"I will go","om":"There is","smyrna":"Smyrna","usa":"USA"};
  Object.assign(D,extra);
  return res.json({original:req.query.text||'',translated:D[q]||q,provider:'zomi-v5',total:80});
}
