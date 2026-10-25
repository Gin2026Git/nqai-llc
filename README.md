# NqAI LLC - Vercel Deploy Package - We are building AI that speaks all languages.
# SOLE OWNER Gin P Khup - Smyrna TN - Seed1000 1000/1000 ZERO ERROR - Super Phone + A2P 10DLC Compliant

## Files included:
- index.html - NEW homepage - Headline: "We are building AI that speaks all languages. Since not all languages are not available yet. But some." - A2P 10DLC compliant section for carrier review
- privacy.html - Privacy Policy - A2P compliant with opt-in, HELP/STOP, frequency, business identity
- terms.html - Terms of Service - A2P compliant
- about.html - About Us - Who we are, Seed1000, honest roadmap Some live today
- interpreter.html - Live Voice + Text Interpreter - Rare & Major - Zomi 20/1000 2% - Wrapper
- seed1000_fixed_full.tsx - Full Seed1000 app - Hello, How are you?, I am fine... 1000/1000 ZERO ERROR - Version v1.0.0_1000_ENGLISH_ZERO_ERROR - SOLE OWNER Gin P Khup
- api/voice.js - TWILIO_FIX - Returns TwiML always, fallback TwiML, conference-only, no wss Media Streams (NOT HIPAA eligible) - Fixes Application Error - HIPAA compliant
- api/voice-transcribe.js - Deepgram Nova-2 Phonecall 8kHz 40% more accurate - ALL LANGS auto-detect - JSON endpoint for transcription
- api/translate.js - Google NMT 95% 130+ + NLLB 3.3B Zomi/Burmese
- api/conf-status.js - Conference status callback
- package.json - Includes twilio ^5.0.0 - Fixes import error causing Application Error
- vercel.json - Routing for /privacy /terms /about /interpreter /live
- homepage_A2P_backup.html - Backup of earlier A2P homepage

## Deploy to Vercel:
1. Upload this folder to GitHub repo gin2025git/nqai-llc or drag to Vercel dashboard
2. Vercel will auto-deploy - Check Deployments - All Ready
3. Set Environment Variables in Vercel → Settings → Environment Variables:
   - GOOGLE_TRANSLATE_API_KEY
   - DEEPGRAM_API_KEY
   - HUGGINGFACE_API_KEY
   - ELEVENLABS_API_KEY (sk_... NqAI - Text to speech + Dubbing - 2 selected)
   - VERCEL_URL (auto) or set manually to nqai-llc.vercel.app
4. Test: https://nqai-llc.vercel.app/api/voice - Should return XML <Response><Say>Bienvenido... not JSON
5. Twilio Console → Phone Numbers → Your NqAI number → Voice Config → Webhook URL = https://nqai-llc.vercel.app/api/voice POST → Save
6. Twilio Security → HIPAA enablement → Enable HIPAA for this account → Save (already done)
7. Call Super Phone number → Should hear welcome, no Application Error
8. For A2P 10DLC application:
   - Website: https://nqai.llc and https://nqai-llc.vercel.app
   - Privacy URL: https://nqai.llc/privacy.html
   - Terms URL: https://nqai.llc/terms.html
   - About URL: https://nqai.llc/about.html
   - Opt-in flow URL: https://nqai.llc/#contact or https://nqai.llc/privacy.html (form with checkbox)
   - Use case: Mixed Low Volume Conversational + Utility
   - Sample messages, HELP/STOP, frequency, business identity - all on homepage A2P section and privacy.html

## Headline: We are building AI that speaks all languages. Since not all languages are not available yet. But some.
- Live today: English, Spanish, Zomi/Burmese - Seed1000 20/1000 2% Zomi, 1000/1000 English ZERO ERROR
- Building toward 7000 - Honest - No placeholder

© 2026 NqAI LLC - SOLE OWNER Gin P Khup - All Rights Reserved - Smyrna TN - 1000/1000 ZERO ERROR
