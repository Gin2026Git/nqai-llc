'use client';
import { useState, useEffect, useRef } from 'react';
const LAST_KEY='nqai_seed_last_index';
const DATA_KEY='nqai_seed_progress_data';
const BASE=["Hello","How are you?","I am fine","What is your name?","My name is...","Good morning","Good afternoon","Good evening","Good night","Thank you","Please","Sorry","Yes","No","Where is market?","How much?","Too expensive","Water please","Food please","My family","My father","My mother","House","Village","School","Today","Tomorrow","Church","Help me","Hospital","Doctor","Phone number"];
const CATS=["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];
function getList(){const l=[];for(let i=0;i<1000;i++){const en=i<BASE.length?BASE[i]:`Common phrase #${i+1}`;l.push({id:i+1,en,cat:CATS[i%CATS.length],suggest:"Na dam?",voice:"na dam?"});}return l;}
export default function Page(){
const all=getList();
const [idx,setIdx]=useState(21);const [zomi,setZomi]=useState("");const [hint,setHint]=useState("");const [done,setDone]=useState<any[]>([]);
const [status,setStatus]=useState("Mic FIXED - Click RECORD now! Resumed 21/1000 ✅");
const [rec,setRec]=useState(false);const recRef=useRef<any>(null);
useEffect(()=>{
const last=localStorage.getItem(LAST_KEY);const data=localStorage.getItem(DATA_KEY);
if(data){try{setDone(JSON.parse(data));}catch{}}if(last){const n=parseInt(last);if(n>=1&&n<=1000)setIdx(n);}else setIdx(21);
},[]);
useEffect(()=>{localStorage.setItem(LAST_KEY,String(idx));},[idx]);
const cur=all[idx-1];
const startRec=()=>{
const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
if(!SR){alert("Mic needs Chrome/Edge. Use Chrome!");return;}
if(rec&&recRef.current){recRef.current.stop();setRec(false);return;}
try{
const r=new SR();r.continuous=false;r.interimResults=true;r.lang='en-US';
r.onstart=()=>{setRec(true);setStatus("🎤 LISTENING... Speak!");};
r.onend=()=>{setRec(false);};r.onerror=()=>{setRec(false);setStatus("Click 🔒 in address bar → Allow Mic → Reload");};
r.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setZomi(t);setHint(t.toLowerCase());};
recRef.current=r;r.start();
}catch{alert("Click 🔒 in address bar → Allow Microphone → Reload");}
};
const save=()=>{
if(!zomi.trim())return;
const entry={id:cur.id,en:cur.en,cat:cur.cat,suggest:cur.suggest,correctZomi:zomi.trim(),voiceHint:hint||zomi.trim().toLowerCase()};
const nd=[...done.filter((c:any)=>c.id!==cur.id),entry].sort((a,b)=>a.id-b.id);
setDone(nd);localStorage.setItem(DATA_KEY,JSON.stringify(nd));setIdx(Math.min(idx+1,1000));setZomi("");setHint("");
};
return(
<div style={{fontFamily:"system-ui",background:"#f6f7f9",minHeight:"100vh"}}><div style={{maxWidth:"1500px",margin:"0 auto",padding:"8px"}}>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"10px",display:"flex",justifyContent:"space-between"}}><b>NqAI Seed1000 - MIC FIXED ✅</b><span>{done.length}/1000</span><button style={{background:"#7c3aed",color:"#fff",borderRadius:"999px",padding:"6px 12px",border:"none"}}>Resume {idx}/1000 ▶️</button></div>
<div style={{marginTop:"8px",background:rec?"#fecaca":"#d1fae5",border:"1px solid",borderColor:rec?"#ef4444":"#22c55e",borderRadius:"8px",padding:"8px",fontSize:"12px",fontWeight:700,textAlign:"center"}}>{rec?"🔴 LISTENING - Speak now!":`✅ MIC FIXED! BOX ${idx}/1000 - ${status}`}</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1.6fr 0.9fr",gap:"12px"}}>
<div>
<div style={{background:"#fff",borderRadius:"12px",padding:"14px",border:"1px solid #e5e7eb"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b>BOX {idx} / 1000 - {cur.cat}</b><div><button onClick={()=>setIdx(Math.max(1,idx-1))}>Prev</button><button onClick={()=>setIdx(Math.min(1000,idx+1))}>Skip</button></div></div>
<div style={{fontSize:"28px",fontWeight:800,marginTop:"10px"}}>❝ {cur.en}</div>
<div style={{marginTop:"14px",background:"#f0fdf4",border:"2px solid #22c55e",borderRadius:"12px",padding:"12px"}}>
<input value={zomi} onChange={e=>setZomi(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}} placeholder="Type correct Zomi or click RECORD" style={{width:"100%",padding:"12px",borderRadius:"10px",border:"1px solid #22c55e"}}/>
<div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
<input value={hint} onChange={e=>setHint(e.target.value)} placeholder="Voice hint" style={{flex:1,padding:"10px",borderRadius:"8px",border:"1px solid #ccc"}}/>
<button onClick={startRec} style={{background:rec?"#ef4444":"#16a34a",color:"#fff",border:"none",borderRadius:"999px",padding:"10px 18px",fontWeight:800,cursor:"pointer"}}>{rec?"● STOP":"● RECORD - CLICK ME!"}</button>
</div>
<button onClick={save} style={{marginTop:"12px",width:"100%",background:"#16a34a",color:"#fff",padding:"12px",borderRadius:"10px",border:"none",fontWeight:800}}>Enter = Save & Next → BOX {idx+1}</button>
</div>
</div>
<div style={{marginTop:"12px",background:"#fff",border:"2px solid #7c3aed",borderRadius:"12px",overflow:"hidden"}}>
<div style={{background:"#7c3aed",color:"#fff",padding:"10px 14px",display:"flex",justifyContent:"space-between"}}><b>👩‍💼 Turn Male into Lady Voice - MIC FIXED!</b><span style={{background:"#fff",color:"#7c3aed",fontSize:"10px",padding:"4px 10px",borderRadius:"999px"}}>CLICKABLE!</span></div>
<div style={{padding:"12px",textAlign:"center"}}>
<button onClick={startRec} style={{width:"80px",height:"80px",borderRadius:"50%",background:rec?"#ef4444":"#7c3aed",color:"#fff",border:"4px solid #fff",boxShadow:"0 4px 12px rgba(0,0,0,0.2)",fontSize:"32px",cursor:"pointer"}}>{rec?"■":"🎤"}</button>
<div style={{marginTop:"8px",fontWeight:700,color:rec?"#ef4444":"#7c3aed"}}>{rec?"🔴 LISTENING... Speak!":"Click mic - Chrome will ask Allow"}</div>
<div style={{marginTop:"8px",fontSize:"10px",color:"#888"}}>If not clickable: Click 🔒 icon in address bar → Allow Microphone → Reload page</div>
</div>
</div>
</div>
</div>
</div></div>
);
}
