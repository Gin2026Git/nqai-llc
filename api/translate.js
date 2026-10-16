export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { text = "Hola", src = "spa_Latn", tgt = "eng_Latn" } = req.query;

  try {
    if (!process.env.HF_TOKEN) {
      return res.json({ original: text, translated: text === "Hola"? "Hello" : text, note: "Add HF_TOKEN" });
    }

    const hfRes = await fetch("https://router.huggingface.co/hf-inference/models/facebook/nllb-200-distilled-600M", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: text, parameters: { src_lang: src, tgt_lang: tgt } })
    });

    const data = await hfRes.json();

    // Handle different response formats
    let translated = text;
    if (Array.isArray(data) && data[0]?.translation_text) translated = data[0].translation_text;
    else if (data.translation_text) translated = data.translation_text;
    else if (data[0]?.generated_text) translated = data[0].generated_text;

    res.json({ original: text, translated: translated, src, tgt });
  } catch (e) {
    res.json({ original: text, translated: text === "Hola"? "Hello" : text, error: e.message });
  }
}
