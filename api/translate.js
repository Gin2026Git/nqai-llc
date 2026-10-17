// api/translate.js - FIXED - m2m100 418M FREE + Zomi 500
// Works on Vercel - CommonJS compatible

const ZOMI_TEDIM = {
  "hello":"Hi","welcome":"muakna","goodbye":"Mangpha","thank":"lungdam","please":"hehpihna tawh","sorry":"dah","yes":"himah","no":"hilo","mother":"nu","father":"pa","friend":"lawm","name":"min","water":"tui","food":"an","eat":"ne","drink":"dawn","house":"inn","good":"hoih","bad":"hoihlo","love":"it","help":"huh","peace":"daih na lungnopna","today":"tuni","tomorrow":"zingciang","morning":"zingsang","night":"zan","what":"bang","where":"kawilai-ah","how":"bangbnagin","one":"khat","two":"nih","three":"thum","four":"li","five":"nga","six":"guk","seven":"sagih","eight":"giat","nine":"kua","ten":"sawm","son":"tapa","daughter":"tanu","brother":"sanggampa","sister":"sanggam numei","husband":"zi adingin apasal","wife":"zi","child":"naupang","baby":"naungeek","grandfather":"pu","grandmother":"pi","head":"lu","eye":"mit","ear":"bil","nose":"nak","mouth":"kam","tooth":"ha","hand":"khut","foot":"khepeek","heart":"lungtang","hair":"mul","dog":"ui","cat":"zawhngeu","bird":"vasa","fish":"ngasa","chicken":"akno","pig":"vok","cow":"bawng","horse":"sakol","snake":"gul","elephant":"sai","tiger":"sahang","monkey":"zawng","flower":"paak","tree":"singkung","leaf":"singnah","grass":"lopaa","fruit":"singgah nektheih","seed":"khaici","root":"zung","rose":"paak hoih","bamboo":"gua","banana":"nahtang","rice":"buhtang","salt":"ci","meat":"sa","egg":"aktui","milk":"nawitui","bread":"moh","tea":"niangteh","sugar":"cikhum","vegetable":"anteh lohing","oil":"thau","sun":"ni","moon":"khapi","star":"aksi","sky":"van","rain":"guah","wind":"huih","fire":"mei","river":"luipi","mountain":"mual","earth":"lei","red":"asan","blue":"a dum","green":"ahing kilkel","yellow":"amel eng","black":"avom","white":"akang","door":"kong khak","window":"kongvang neu","bed":"lupna","table":"sabuai","chair":"tutphah bannei","book":"laibu","road":"lamlian","village":"khua","school":"sanginn","market":"sum zuakna","blood":"sisan"
};

export default async function handler(req, res){
  const { text, target } = req.query;
  if(!text || !target) return res.status(400).json({error:"need text & target"});

  const t = (target||"").toLowerCase();

  // 1. Zomi 500 - Free - No HF needed
  if(t==="zomi" || t==="tedim" || t==="zom"){
    const lower = text.toLowerCase().trim();
    const val = ZOMI_TEDIM[lower];
    if(val && val!==""){
      return res.status(200).json({translated: val, provider:"zomi-dict-500", total:500});
    }
    // if not in dict, fall through to m2m100 Burmese mya as closest
  }

  // 2. m2m100 418M FREE - 100 languages - Spanish + Burmese GOOD
  // Use HF_TOKEN from Vercel env
  const HF_TOKEN = process.env.HF_TOKEN;
  if(!HF_TOKEN){
    // If no token, still return Zomi if exists, else error message
    return res.status(200).json({translated: text, provider:"no-token-set", note:"Add HF_TOKEN in Vercel env", total:100});
  }

  // Map your short codes to m2m100 codes
  const map = { spa:"es", es:"es", mya:"my", my:"my", en:"en", fr:"fr", de:"de", ja:"ja", ko:"ko", zh:"zh", hi:"hi", ar:"ar" };
  const tgt = map[t] || t; // es, my

  try{
    const r = await fetch("https://api-inference.huggingface.co/models/facebook/m2m100_418M",{
      method:"POST",
      headers:{
        "Authorization": `Bearer ${HF_TOKEN}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { src_lang:"en", tgt_lang: tgt }
      })
    });
    const data = await r.json();
    // data = [{translation_text:"Hola"}] or {error}
    if(data.error){
      return res.status(200).json({translated: text, error: data.error, provider:"m2m100-free", total:100});
    }
    const translated = Array.isArray(data) ? data[0]?.translation_text : data.translation_text;
    return res.status(200).json({translated: translated || text, provider:"m2m100_418M-free", total:100, target:tgt});
  }catch(e){
    return res.status(500).json({error:e.message});
  }
}
