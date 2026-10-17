"use client";
import { useState } from 'react';

export default function Web(){
  const [text,setText]=useState("Hello");
  const [target,setTarget]=useState("zomi");
  const [out,setOut]=useState("");
  const [loading,setLoading]=useState(false);

  async function translate(){
    setLoading(true);
    try{
      const r = await fetch(`/api/translate?text=${encodeURIComponent(text)}&target=${target}`);
      const d = await r.json();
      const translated = d.translated || "";
      setOut(translated);
      if(translated){
        const u = new SpeechSynthesisUtterance(translated);
        if(target==="spa") u.lang="es-ES";
        else if(target==="mya") u.lang="my-MM";
        else u.lang="en-US";
        window.speechSynthesis.speak(u);
      }
    }catch(e){
      setOut("error fetch failed");
    }
    setLoading(false);
  }

  function listen(){
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRec){
      alert("Please use Chrome on laptop");
      return;
    }
    const rec = new SpeechRec();
    rec.lang="en-US";
    rec.onresult = (e)=> setText(e.results[0][0].transcript);
    rec.start();
  }

  return (
    <div style={{padding:20,fontFamily:"system-ui, sans-serif"}}>
      <h1>NqAI Web - Phone-(Twilio+Web)-Phone</h1>
      <p>Zomi 500 + Spanish + Burmese GOOD on 100 free - No paid</p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
        <button onClick={listen} style={{padding:"10px 14px",borderRadius:8,border:"1px solid #ccc",cursor:"pointer"}}>🎤 Speak</button>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type Hello" style={{padding:10,width:280,borderRadius:8,border:"1px solid #ccc"}} />
        <select value={target} onChange={e=>setTarget(e.target.value)} style={{padding:10,borderRadius:8}}>
          <option value="zomi">Zomi (Tedim) 500 - tui</option>
          <option value="spa">Spanish - Hola</option>
          <option value="mya">Burmese - မင်္ဂလာပါ</option>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
        <button onClick={translate} style={{padding:"10px 16px",borderRadius:8,background:"black",color:"white",cursor:"pointer"}}>{loading?"...":"Translate + Speak"}</button>
      </div>
      <h2 style={{marginTop:30,fontSize:48,lineHeight:"1.2"}}>{out}</h2>
      <div style={{marginTop:20,fontSize:14,color:"#666"}}>
        <p>API: /api/translate?text=water&target=zomi → tui</p>
        <p>API: /api/translate?text=Hello&target=spa → Hola</p>
        <p>API: /api/translate?text=Hello&target=mya → မင်္ဂလာပါ</p>
      </div>
    </div>
  );
}
