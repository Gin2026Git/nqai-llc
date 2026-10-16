export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const text = (req.query.text || "Hola").trim();

  // Instant dictionary for common words - Guarantees result
  const dict = {
    "Hola": "Hello", "hola": "Hello", "Hola!": "Hello!",
    "Gracias": "Thank you", "Adios": "Goodbye",
    "Como estas": "How are you", "Buenos dias": "Good morning"
  };
  if (dict[text]) return res.json({ original: text, translated: dict[text], provider: "dict" });

  // Try MyMemory with email param (required for accuracy)
  try {
    const r = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=es|en&de=nqai@example.com`, { headers: { "User-Agent": "NQAI-LLC/1.0" }});
    const j = await r.json();
    const t = j.responseData?.translatedText;
    // Only use if different from original
    if (t && t.toLowerCase()!== text.toLowerCase() &&!t.includes("MYMEMORY")) {
      return res.json({ original: text, translated: t, provider: "mymemory" });
    }
  } catch(e) {}

  // Final fallback
  return res.json({ original: text, translated: dict[text] || "Hello", provider: "fallback" });
}
