// pages/web.js - NqAI Web - Phone-(Twilio+Web)-Phone worldwide
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
      setOut(d.translated || "");
      if(d.translated){
        const u = new SpeechSynthesisUtterance(d.translated);
        if(target==="spa") u.lang="es-ES";
        else if(target==="mya") u.lang="my-MM";
        else u.lang="en-US";
        speechSynthesis.speak(u);
      }
    }catch(e){ setOut("error fetch failed"); }
    setLoading(false);
  }

  function listen(){
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!SpeechRec){ alert("Use Chrome"); return; }
    const rec = new SpeechRec();
    rec.lang="en-US";
    rec.onresult = e=> setText(e.results[0][0].transcript);
    rec.start();
  }

  return (
    <div style={{padding:20,fontFamily:"system-ui"}}>
      <h1>NqAI Web - Phone-(Twilio+Web)-Phone</h1>
      <p>Zomi 500 + Spanish + Burmese GOOD on 100 free - No paid</p>
      <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
        <button onClick={listen} style={{padding:10}}>🎤 Speak English</button>
        <input value={text} onChange={e=>setText(e.target.value)} style={{padding:10,width:300}} placeholder="Type Hello"/>
        <select value={target} onChange={e=>setTarget(e.target.value)} style={{padding:10}}>
          <option value="zomi">Zomi (Tedim) 500 - tui</option>
          <option value="spa">Spanish - Hola</option>
          <option value="mya">Burmese - မင်္ဂလာပါ</option>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
        <button onClick={translate} style={{padding:10,background:"black",color:"white"}}>{loading?"...":"Translate + Speak"}</button>
      </div>
      <h2 style={{marginTop:30,fontSize:40}}>{out}</h2>
      <p>API: /api/translate?text=water&target=zomi → tui</p>
      <p>API: /api/translate?text=Hello&target=spa → Hola</p>
      <p>API: /api/translate?text=Hello&target=mya → မင်္ဂလာပါ</p>
    </div>
  );
}
