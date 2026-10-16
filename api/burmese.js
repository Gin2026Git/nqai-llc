export default function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const q=(req.query.text||'').toLowerCase().trim();
  const D={"mingalaba":"Hello","nay kaung la":"How are you","kyay zu tin bar tal":"Thank you","kyay zu":"Thank you","hawt":"Yes","ma hawt bu":"No","ye":"Water","hta min":"Rice","sa pi bi":"Eat","bae ma":"Where","po fla":"Money","ka ma":"Help","sayar":"Doctor","se khan":"Hospital","nay kaung":"Good","myanmar":"Myanmar","smyrna":"Smyrna","usa":"USA","ein":"House","la":"Come","thwa":"Go","chit":"Love"};
  return res.json({original:req.query.text||'',translated:D[q]||q,provider:'burmese-v5',total:30});
}
