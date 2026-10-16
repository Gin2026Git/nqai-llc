export default async function handler(req, res) {
  const { text = "Hola", src = "spa_Latn", tgt = "eng_Latn" } = req.query;
  const hf = await fetch("https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.HF_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ inputs: text, parameters: { src_lang: src, tgt_lang: tgt } })
  });
  const data = await hf.json();
  res.json({ original: text, translated: data[0]?.translation_text || text });
}
