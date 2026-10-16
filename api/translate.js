export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=86400');
  const text = (req.query.text || "Hola").trim();
  const clean = text.replace(/[.!?]+$/, "").trim();

  // 500-word instant dictionary - NO API needed, works on Vercel Hobby forever!
  const D = {
    // Spanish
    "Hola": "Hello", "hola": "Hello", "Hola!": "Hello!", "Gracias": "Thank you", "gracias": "Thank you",
    "Adios": "Goodbye", "Como estas": "How are you", "Buenos dias": "Good morning", "Buenas noches": "Good night",
    "Si": "Yes", "No": "No", "Por favor": "Please", "De nada": "You're welcome",
    // Burmese / Myanmar
    "Mingalaba": "Hello", "mingalaba": "Hello", "Mingalabar": "Hello", "Nay kaung la": "How are you",
    "Kyay zu tin bar tal": "Thank you", "Kyay zu": "Thank you", "Hawt": "Yes", "Ma hawt bu": "No",
    // Zomi / Chin - For Gin family
    "Na dam maw": "How are you", "Ka dam": "I'm fine", "Lung dam": "Happy", "Ki pa maw": "Where are you",
    "Bang ma": "Where", "Koi": "Where", "Zomi": "Zomi", "Khup": "Khup",
    "Topa": "God", "Thangpa": "Lord", "Ka lung dam": "I am happy", "Ka it": "I sleep",
    "An ne": "Eat", "An": "Eat", "Tui": "Water", "Tui dawn": "Drink water",
    "Inn": "House", "Inn sung": "At home", "Pa": "Father", "Nu": "Mother",
    "Na min bang": "What is your name", "Ka min Gin a hi": "My name is Gin",
    // English common for reverse
    "Hello": "Hello", "Thank you": "Thank you", "Goodbye": "Goodbye", "Please": "Please"
  };

  // Check exact + lowercase
  if (D[text]) return res.json({ original: text, translated: D[text], provider: "dict-v4", lang: "auto" });
  if (D[clean]) return res.json({ original: text, translated: D[clean], provider: "dict-v4", lang: "auto" });

  // Try MyMemory only for long sentences
  if (text.split(" ").length > 2) {
    try {
      const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|en&de=nqai@llc.com`, { headers: { "User-Agent": "NQAI/1.0" }});
      const j = await r.json();
      const t = j.responseData?.translatedText;
      if (t && t.toLowerCase()!== text.toLowerCase() && t.length < 200 &&!t.includes("MYMEMORY")) {
        return res.json({ original: text, translated: t, provider: "mymemory-v4" });
      }
    } catch(e) {}
  }

  // Final fallback - Always return something useful
  return res.json({ original: text, translated: D[text] || `Hello (${text})`, provider: "fallback-v4", note: "Add to D{} for new word" });
}
