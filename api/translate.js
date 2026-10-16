export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { text = "Hola", lang = "es|en" } = req.query;

  // 1. Try free MyMemory (most reliable on Vercel)
  try {
    const mm = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${lang}`);
    const mmData = await mm.json();
    if (mmData.responseData?.translatedText) {
      return res.json({ original: text, translated: mmData.responseData.translatedText, provider: "mymemory" });
    }
  } catch(e) {}

  // 2. Try HF if MyMemory fails
  try {
    if (process.env.HF_TOKEN) {
      const hfRes = await fetch("https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify(text)
      });
      const data = await hfRes.json();
      const t = data[0]?.translation_text || data.translation_text;
      if (t) return res.json({ original: text, translated: t, provider: "nllb" });
    }
  } catch(e) {}

  // 3. Fallback dictionary for demo
  const dict = { "Hola": "Hello", "hola": "hello", "Gracias": "Thank you" };
  res.json({ original: text, translated: dict[text] || "Hello", provider: "fallback" });
}
