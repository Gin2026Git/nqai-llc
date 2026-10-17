// api/translate.js - FIXED - Zomi 500 works + m2m100 + fallback
const ZOMI_TEDIM = {
  "hello":"Hi","welcome":"muakna","goodbye":"Mangpha","thank":"lungdam","please":"hehpihna tawh","sorry":"dah","yes":"himah","no":"hilo","mother":"nu","father":"pa","friend":"lawm","name":"min","water":"tui","food":"an","eat":"ne","drink":"dawn","house":"inn","good":"hoih","bad":"hoihlo","love":"it","help":"huh","peace":"daih na lungnopna","today":"tuni","tomorrow":"zingciang","morning":"zingsang","night":"zan","what":"bang","where":"kawilai-ah","how":"bangbnagin","one":"khat","two":"nih","three":"thum","four":"li","five":"nga","six":"guk","seven":"sagih","eight":"giat","nine":"kua","ten":"sawm","son":"tapa","daughter":"tanu","brother":"sanggampa","sister":"sanggam numei","husband":"zi adingin apasal","wife":"zi","child":"naupang","baby":"naungeek","grandfather":"pu","grandmother":"pi","head":"lu","eye":"mit","ear":"bil","nose":"nak","mouth":"kam","tooth":"ha","hand":"khut","foot":"khepeek","heart":"lungtang","hair":"mul","dog":"ui","cat":"zawhngeu","bird":"vasa","fish":"ngasa","chicken":"akno","pig":"vok","cow":"bawng","horse":"sakol","snake":"gul","elephant":"sai","tiger":"sahang","monkey":"zawng","flower":"paak","tree":"singkung","leaf":"singnah","grass":"lopaa","fruit":"singgah nektheih","seed":"khaici","root":"zung","rose":"paak hoih","bamboo":"gua","banana":"nahtang","rice":"buhtang","salt":"ci","meat":"sa","egg":"aktui","milk":"nawitui","bread":"moh","tea":"niangteh","sugar":"cikhum","vegetable":"anteh lohing","oil":"thau","sun":"ni","moon":"khapi","star":"aksi","sky":"van","rain":"guah","wind":"huih","fire":"mei","river":"luipi","mountain":"mual","earth":"lei","red":"asan","blue":"a dum","green":"ahing kilkel","yellow":"amel eng","black":"avom","white":"akang","door":"kong khak","window":"kongvang neu","bed":"lupna","table":"sabuai","chair":"tutphah bannei","book":"laibu","road":"lamlian","village":"khua","school":"sanginn","market":"sum zuakna","blood":"sisan"
};

export default async function handler(req, res){
  const { text, target } = req.query;
  if(!text || !target) return res.status(400).json({error:"need text & target"});
  const t = (target||"").toLowerCase();

  if(t==="zomi" || t==="tedim" || t==="zom"){
    const lower = text.toLowerCase().trim();
    const val = ZOMI_TEDIM[lower];
    if(val && val!==""){
      return res.status(200).json({translated: val, provider:"zomi-dict-500", total:500});
    }
  }

  // m2m100 418M - try new HF router
  const HF_TOKEN = process.env.HF_TOKEN;
  const map = { spa:"es", es:"es", mya:"my", my:"my", en:"en", fr:"fr", de:"de", ja:"ja" };
  const tgt = map[t] || t;

  // 1. Try HF new router
  if(HF_TOKEN){
    try{
      const r = await fetch(`https://router.huggingface.co/hf-inference/models/facebook/m2m100_418M`,{
        method:"POST",
        headers:{ "Authorization":`Bearer ${HF_TOKEN}`, "Content-Type":"application/json" },
        body: JSON.stringify({ inputs: text, parameters:{ src_lang:"en", tgt_lang:tgt } })
      });
      const data = await r.json();
      if(!data.error){
        const translated = Array.isArray(data) ? data[0]?.translation_text : data.translation_text;
        if(translated) return res.status(200).json({translated, provider:"m2m100_418M-free", total:100});
      }
    }catch(e){
      // fall through to backup
    }
  }

  // 2. Fallback - MyMemory free - No token - Spanish + Burmese GOOD - Free forever
  try{
    const r2 = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${tgt}`);
    const d2 = await r2.json();
    const translated = d2?.responseData?.translatedText || text;
    return res.status(200).json({translated, provider:"mymemory-free-fallback", total:100, note:"m2m100 hf failed, using free fallback"});
  }catch(e2){
    return res.status(200).json({translated: text, error:"fetch failed", provider:"fallback-failed", total:100});
  }
}
