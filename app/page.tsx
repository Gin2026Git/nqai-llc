"use client";
import { useState, useEffect, useRef } from "react";

export default function Page() {
  const [srcText, setSrcText] = useState("Hello, how can I help you?");
  const [tgtText, setTgtText] = useState("");
  const [srcLang, setSrcLang] = useState("en-US");
  const [tgtLang, setTgtLang] = useState("es");
  const [status, setStatus] = useState("Ready. Chrome/Edge mic works. Or type and translate.");
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const doTranslate = async () => {
    const q = srcText.trim();
    if (!q) { setStatus("Type something first"); return; }
    setStatus("Translating...");
    const s = srcLang.split("-")[0];
    const t = tgtLang;
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=${s}|${t}`;
      const r = await fetch(url);
      const j = await r.json();
      if (j?.responseData?.translatedText) {
        setTgtText(j.responseData.translatedText);
        setStatus("Translated • Ready to play lady voice");
        return;
      }
    } catch {}
    setTgtText(`[${t}] ${q}`);
    setStatus("Demo translation • Ready to play");
  };

  const speakTranslated = () => {
    const txt = tgtText.trim();
    if (!txt) { setStatus("No translation to speak"); return; }
    const utter = new SpeechSynthesisUtterance(txt);
    const voices = speechSynthesis.getVoices();
    const pref = voices.find(v => /female|zira|samantha|karen/i.test(v.name)) || voices[0];
    if (pref) utter.voice = pref;
    (utter as any).rate = 1.0;
    (utter as any).pitch = 1.05;
    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
    setStatus("🔊 Playing Professional Lady Front Desk");
  };

  const startRec = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setStatus("Mic not supported — Type instead"); return; }
    if (listening && recRef.current) { recRef.current.stop(); return; }
    const rec = new SR();
    rec.continuous = false; rec.interimResults = true; rec.lang = srcLang;
    rec.onstart = () => { setListening(true); setStatus("Listening... Speak now"); };
    rec.onend = () => { setListening(false); };
    rec.onresult = (e: any) => {
      let t = ""; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
      setSrcText(t);
      if (e.results[e.results.length - 1].isFinal) { setTimeout(doTranslate, 300); }
    };
    recRef.current = rec;
    rec.start();
  };

  return (
    <div style={{fontFamily:"system-ui, sans-serif", background:"#fbfbfd", minHeight:"100vh"}}>
      <div style={{position:"sticky", top:0, background:"#ffffffcc", backdropFilter:"blur(12px)", borderBottom:"1px solid #eee", display:"flex", justifyContent:"space-between", padding:"14px 18px"}}>
        <div style={{fontWeight:800}}>NqAI <span style={{color:"#7c3aed"}}>LLC</span> • AI Interpreter</div>
        <div style={{display:"flex", gap:"10px"}}>
          <a href="#live" style={{background:"#7c3aed", color:"#fff", borderRadius:"999px", padding:"8px 14px", textDecoration:"none", fontWeight:700}}>Live Interpreter</a>
          <a href="/seed1000/" style={{border:"1px solid #e5e7eb", background:"#fff", borderRadius:"999px", padding:"8px 14px", textDecoration:"none", color:"#111"}}>Seed1000 20/1000</a>
        </div>
      </div>
      <div style={{maxWidth:"1200px", margin:"0 auto", padding:"28px 18px", display:"grid", gridTemplateColumns:"1.1fr 0.9fr", gap:"24px"}}>
        <div>
          <div style={{fontSize:"38px", fontWeight:900, lineHeight:"1.05"}}>Live Voice + Text Interpreter — Rare & Major Languages.</div>
          <div style={{color:"#4b5563", marginTop:"8px"}}>Professional Front Desk Lady Voice • Polite • Normal Speed</div>
          <div style={{background:"#fff", border:"1px solid #e5e7eb", borderRadius:"18px", padding:"16px", marginTop:"16px"}}>
            <div style={{fontWeight:800}}>🌱 Zomi Seed1000 20/1000 — 2%</div>
            <div style={{height:"10px", background:"#f3f4f6", borderRadius:"999px", marginTop:"8px"}}><div style={{width:"2%", height:"100%", background:"#7c3aed"}}></div></div>
          </div>
        </div>
        <div style={{background:"#fff", border:"1px solid #e5e7eb", borderRadius:"18px", padding:"16px"}}>
          <div style={{fontWeight:800}}>Mini Live Demo</div>
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginTop:"10px"}}>
            <select value={srcLang} onChange={e=>setSrcLang(e.target.value)} style={{padding:"10px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option value="en-US">English</option><option value="es-ES">Spanish</option><option value="zh-CN">Chinese</option><option value="hi-IN">Hindi</option></select>
            <select value={tgtLang} onChange={e=>setTgtLang(e.target.value)} style={{padding:"10px", borderRadius:"10px", border:"1px solid #e5e7eb"}}><option value="es">Spanish</option><option value="en">English</option><option value="zh">Chinese</option></select>
          </div>
          <button onClick={startRec} style={{width:"100%", background:listening?"#dc2626":"#111", color:"#fff", borderRadius:"999px", padding:"16px", fontWeight:800, border:0, marginTop:"10px"}}>{listening ? "🔴 Listening..." : "🎤 Click to Speak"}</button>
          <textarea value={srcText} onChange={e=>setSrcText(e.target.value)} rows={3} style={{width:"100%", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"14px", marginTop:"10px"}}></textarea>
          <div style={{display:"flex", gap:"8px", marginTop:"8px"}}>
            <button onClick={doTranslate} style={{background:"#111", color:"#fff", borderRadius:"12px", padding:"12px 16px", border:0, fontWeight:800}}>Translate →</button>
            <button onClick={speakTranslated} style={{background:"#7c3aed", color:"#fff", borderRadius:"12px", padding:"12px 16px", border:0, fontWeight:800}}>🔊 Play Lady</button>
          </div>
          <textarea value={tgtText} rows={3} style={{width:"100%", borderRadius:"14px", border:"1px solid #e5e7eb", padding:"14px", background:"#f9f5ff", marginTop:"10px"}} placeholder="Translation here..."></textarea>
          <div style={{fontSize:"12px", color:"#6b7280", marginTop:"8px"}}>{status}</div>
        </div>
      </div>
    </div>
  );
}
