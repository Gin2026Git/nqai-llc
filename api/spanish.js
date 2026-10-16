export default function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const q=(req.query.text||'').toLowerCase().trim();
  const D={"hola":"Hello","gracias":"Thank you","adios":"Goodbye","si":"Yes","no":"No","por favor":"Please","buenos dias":"Good morning","buenas noches":"Good night","como estas":"How are you","te amo":"I love you","casa":"House","agua":"Water","comida":"Food","dinero":"Money","trabajo":"Work","ayuda":"Help","donde":"Where","amigo":"Friend","familia":"Family","dios":"God","dios te bendiga":"God bless you","smyrna":"Smyrna","usa":"USA"};
  return res.json({original:req.query.text||'',translated:D[q]||q,provider:'spanish-v5',total:30});
}
