import { NextRequest, NextResponse } from 'next/server'
const MAP:any={en:'eng_Latn',es:'spa_Latn',my:'mya_Mymr',zom:'mya_Mymr',tcz:'mya_Mymr',ted:'mya_Mymr'}
export async function POST(req:NextRequest){
 const {text,srcLang,tgtLang}=await req.json()
 const src=MAP[srcLang]||'eng_Latn';const tgt=MAP[tgtLang]||'eng_Latn'
 const KEY=process.env.HF_API_KEY||process.env.HF_TOKEN
 if(KEY){
  try{const r=await fetch('https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M',{method:'POST',headers:{Authorization:`Bearer ${KEY}`,'Content-Type':'application/json'},body:JSON.stringify({inputs:text,parameters:{src_lang:src,tgt_lang:tgt}})});if(r.ok){const d=await r.json();const t=d[0]?.translation_text||d?.translation_text;if(t)return NextResponse.json({translated:t,engine:'NLLB-200'})}}catch{}
 }
 const f=srcLang==='zom'?'my':srcLang;const to=tgtLang==='zom'?'my':tgtLang
 const m=await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${f}|${to}`);const md=await m.json()
 return NextResponse.json({translated:md.responseData.translatedText,engine:'Demo'})
}
