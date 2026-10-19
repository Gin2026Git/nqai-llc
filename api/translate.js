// NqAI - All Major Languages Translator
const MAJOR_LANGS = {
  'en':'English','es':'Spanish','zh':'Chinese','hi':'Hindi','ar':'Arabic',
  'fr':'French','de':'German','ru':'Russian','pt':'Portuguese','ja':'Japanese',
  'ko':'Korean','it':'Italian','tr':'Turkish','nl':'Dutch','pl':'Polish',
  'vi':'Vietnamese','th':'Thai','id':'Indonesian','ms':'Malay','bn':'Bengali',
  'ur':'Urdu','ta':'Tamil','te':'Telugu','mr':'Marathi','gu':'Gujarati',
  'kn':'Kannada','ml':'Malayalam','pa':'Punjabi','fa':'Persian','sw':'Swahili',
  'my':'Burmese','tcd':'Tiddim Chin','zai':'Zomi'
};

const VOICE_MAP = {
  'en':'Polly.Joanna','es':'Polly.Mia','zh':'Polly.Zhiyu','hi':'Polly.Aditi',
  'ar':'Polly.Zeina','fr':'Polly.Celine','de':'Polly.Marlene','ja':'Polly.Mizuki',
  'ko':'Polly.Seoyeon','it':'Polly.Bianca','pt':'Polly.Camila','ru':'Polly.Tatyana',
  'hi':'Polly.Aditi','default':'Polly.Joanna'
};

export default async function handler(req, res) {
  const text = req.query.text || req.body?.text || "";
  let from = (req.query.from || 'auto').toLowerCase();
  let to = (req.query.to || 'auto').toLowerCase();
  
  if(!text) return res.json({error:"no text"});

  // Auto-detect with Groq
  const prompt = `Detect language of: "${text}" and translate. 
  From: ${from} (auto=detect), To: ${to} (if auto, translate to English if source not English, else to Spanish).
  Supported: ${Object.keys(MAJOR_LANGS).join(',')}.
  Return ONLY JSON: {"from":"code","to":"code","translated":"translation"}`;

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      messages: [{role:"user", content: prompt}],
      temperature: 0.2
    })
  });
  
  const data = await groqRes.json();
  let result = {translated: text, from, to, source: "groq+dict+ml"};
  try {
    const content = data.choices[0].message.content;
    result = {...result, ...JSON.parse(content.match(/\{.*\}/s)[0])};
  } catch(e) {
    result.translated = text; // fallback
  }
  
  result.dialect = result.to;
  result.voice = VOICE_MAP[result.to] || VOICE_MAP.default;
  return res.json(result);
}
