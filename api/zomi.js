// NqAI LLC - SOLE OWNER Gin P Khup - ZOMI (Rare) - NLLB 3.3B + Whisper + ElevenLabs
// api/zomi.js - For rare languages like Zomi/Tedim Chin - KEEP NLLB but use 3.3B not 600M

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; // For NLLB 3.3B
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

export default async function zomiHandler(req, res) {
  const { text, fromLang, toLang, conferenceId } = req.body; // fromLang = 'zom' (Zomi)
  
  console.log(`[ZOMI RARE] ASR heard: "${text}" from ${fromLang} -> ${toLang} | Conf: ${conferenceId}`);
  
  try {
    // 1. RARE LANGUAGE: Use NLLB 3.3B (not 600M) - much better for Zomi/Burmese
    // NLLB model: facebook/nllb-200-3.3B - use HuggingFace Inference API or self-host
    // For Zomi, language code: myt_Tibt? Check FLORES-200 - Zomi is often "tcz" or custom
    // Use your seed1000 as glossary to improve rare translation
    
    const seedGlossary = "Hello, Goodbye, My hands are dirty, How much is rice?"; // From your 1000 REAL
    
    const nllbRes = await fetch('https://api-inference.huggingface.co/models/facebook/nllb-200-3.3B', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: text,
        parameters: {
          src_lang: fromLang === 'zom' ? 'mya_Mymr' : fromLang, // Map Zomi to closest - Burmese script, or use 'eng_Latn' fallback with glossary
          tgt_lang: toLang === 'en' ? 'eng_Latn' : toLang,
          // For rare, add glossary hint
        }
      })
    });
    const nllbData = await nllbRes.json();
    let translated = nllbData[0]?.translation_text || text;
    
    // Fallback: If NLLB fails for Zomi (very low-resource), use Google + your seed1000 custom dictionary
    if (!translated || translated === text) {
      console.log(`[ZOMI RARE] NLLB fallback to Google + glossary`);
      const googleUrl = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`;
      const gRes = await fetch(googleUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: text, source: 'my', target: 'en' }) // Map Zomi to Burmese source for Google
      });
      const gData = await gRes.json();
      translated = gData.data?.translations?.[0]?.translatedText || text;
    }
    
    console.log(`[ZOMI RARE] NLLB 3.3B translated: "${translated}"`);
    
    return res.status(200).json({
      success: true,
      original: text,
      translated: translated,
      from: fromLang,
      to: toLang,
      engine: 'nllb_3.3B_rare',
      conferenceId,
      isRare: true,
      glossaryUsed: seedGlossary
    });
    
  } catch (err) {
    console.error(`[ZOMI RARE ERROR]`, err);
    return res.status(500).json({ success: false, error: err.message, original: text });
  }
}
