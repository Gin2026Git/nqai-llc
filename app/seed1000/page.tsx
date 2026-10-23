'use client';
import { useState, useEffect, useRef } from 'react';
const LAST_KEY='nqai_seed_last_index';
const DATA_KEY='nqai_seed_progress_data';
const BASE=["Hello","How are you?","I am fine","What is your name?","My name is...","Good morning","Good afternoon","Good evening","Good night","Thank you","Please","Sorry","Yes","No","Where is market?","How much?","Too expensive","Water please","Food please","My family","My father","My mother","House","Village","School","Today","Tomorrow","Church","Help me","Hospital","Doctor","Phone number"];
const CATS=["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];
function getList(){const l=[];for(let i=0;i<1000;i++){const en=i<BASE.length?BASE[i]:`Common phrase #${i+1}`;l.push({id:i+1,en,cat:CATS[i%CATS.length],suggest:"Na dam?",voice:"na dam?"});}return l;}
export default function Page(){
const all=getList();
const [idx,setIdx]=useState(4);
const [zomi,setZomi]=useState("");const [hint,setHint]=useState("");const [done,setDone]=useState<any[]>([]);
const [status,setStatus]=useState("Cleaner + Mic + 3 Backups ✅ BOX 4/1000");
const [rec,setRec]=useState(false);const recRef=useRef<any>(null);
useEffect(()=>{
const last=localStorage.getItem(LAST_KEY);const data=localStorage.getItem(DATA_KEY);
if(data){try{const d=JSON.parse(data);setDone(d);if(d.length>=4){setIdx(d.length+1);return;}}catch{}}
if(last){const n=parseInt(last);if(n>=1&&n<=1000)setIdx(n);}else setIdx(4);
},[]);
useEffect(()=>{localStorage.setItem(LAST_KEY,String(idx));},[idx]);
const cur=all[idx-1];
const startRec=()=>{
const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
if(!SR){return;}if(rec&&recRef.current){recRef.current.stop();setRec(false);return;}
const r=new SR();r.continuous=false;r.interimResults=true;r.lang='en-US';
r.onstart=()=>{setRec(true);setStatus("🎤 LISTENING...");};r.onend=()=>{setRec(false);};
r.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setZomi(t);setHint(t.toLowerCase());};
recRef.current=r;r.start();
};
const save=()=>{
if(!zomi.trim())return;
const entry={id:cur.id,en:cur.en,cat:cur.cat,suggest:cur.suggest,correctZomi:zomi.trim(),voiceHint:hint||zomi.trim().toLowerCase()};
const nd=[...done.filter((c:any)=>c.id!==cur.id),entry].sort((a,b)=>a.id-b.id);
setDone(nd);localStorage.setItem(DATA_KEY,JSON.stringify(nd));setIdx(Math.min(idx+1,1000));setZomi("");setHint("");
};
const exportCSV=()=>{const h="id,english,correct,voice\n";const r=done.map((c:any)=>`${c.id},"${c.en}","${c.correctZomi}","${c.voiceHint}"`).join("\n");const blob=new Blob([h+r],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}.csv`;a.click();};
const exportJSON=()=>{const blob=new Blob([JSON.stringify(done,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}.json`;a.click();};
const exportJSONL=()=>{const r=done.map((c:any)=>JSON.stringify(c)).join("\n");const blob=new Blob([r],{type:'application/jsonl'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}.jsonl`;a.click();};
const exportJS=()=>{const js=`export const seed1000Backup = ${JSON.stringify(done,null,2)};`;const blob=new Blob([js],{type:'application/javascript'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}.js`;a.click();};
const exportVoices=()=>{const info=done.map((c:any)=>`${c.id}. ${c.en} -> ${c.correctZomi}`).join("\n");const blob=new Blob([info],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_voices.txt`;a.click();};
return(
<div style={{fontFamily:"system-ui",background:"#f6f7f9",minHeight:"100vh"}}><div style={{maxWidth:"1200px",margin:"0 auto",padding:"8px"}}>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"10px"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b>NqAI Seed1000 - MIC FIXED ✅ Cleaner + 3 Backups</b><span>{done.length}/1000 - {idx}/1000</span></div>
<div style={{marginTop:"8px",display:"flex",gap:"6px",flexWrap:"wrap"}}>
<span style={{fontSize:"11px",fontWeight:700}}>💾 3 BACKUP TAPS RESTORED:</span>
<button onClick={exportJSON} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#fff",cursor:"pointer"}}>📥 JSON</button>
<button onClick={exportCSV} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#fff",cursor:"pointer",fontWeight:700}}>📥 CSV</button>
<button onClick={exportJSONL} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#fff",cursor:"pointer"}}>📥 JSONL</button>
<button onClick={exportJS} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#e0e7ff",cursor:"pointer",fontWeight:700}}>📥 JS</button>
<button onClick={exportVoices} style={{fontSize:"11px",background:"#000",color:"#fff",borderRadius:"999px",padding:"6px 12px",border:"none",cursor:"pointer"}}>🎤 Voices.zip</button>
<button style={{fontSize:"11px",background:"#7c3aed",color:"#fff",borderRadius:"999px",padding:"6px 12px",border:"none"}}>Resume {idx}/1000 ▶️</button>
</div>
</div>
<div style={{marginTop:"8px",background:rec?"#fecaca":"#d1fae5",borderRadius:"8px",padding:"8px",fontSize:"12px",fontWeight:700,textAlign:"center"}}>{rec?"🔴 LISTENING...":`✅ ${status}`}</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1.1fr 0.6fr",gap:"12px"}}>
<div style={{background:"#fff",borderRadius:"12px",padding:"14px",border:"1px solid #e5e7eb"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b>BOX {idx} / 1000 - {cur.cat}</b><div><button onClick={()=>setIdx(Math.max(1,idx-1))}>Prev</button><button onClick={()=>setIdx(Math.min(1000,idx+1))}>Skip</button></div></div>
<div style={{fontSize:"26px",fontWeight:800,marginTop:"12px"}}>❝ {cur.en}</div>
<div style={{marginTop:"14px",background:"#f0fdf4",border:"2px solid #22c55e",borderRadius:"12px",padding:"12px"}}>
<input value={zomi} onChange={e=>setZomi(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}} placeholder="Type correct Zomi or click RECORD" autoFocus style={{width:"100%",padding:"12px",borderRadius:"10px",border:"1px solid #22c55e"}}/>
<div style={{display:"flex",gap:"8px",marginTop:"8px"}}>
<input value={hint} onChange={e=>setHint(e.target.value)} placeholder="Voice hint" style={{flex:1,padding:"10px",borderRadius:"8px",border:"1px solid #ccc"}}/>
<button onClick={startRec} style={{background:rec?"#ef4444":"#16a34a",color:"#fff",border:"none",borderRadius:"999px",padding:"10px 18px",fontWeight:800,cursor:"pointer"}}>{rec?"● STOP":"● RECORD - CLICK ME!"}</button>
</div>
<button onClick={save} style={{marginTop:"12px",width:"100%",background:"#16a34a",color:"#fff",padding:"12px",borderRadius:"10px",border:"none",fontWeight:800}}>Enter = Save & Next → BOX {idx+1}</button>
</div>
</div>
<div style={{background:"#7c3aed",color:"#fff",borderRadius:"12px",padding:"12px",textAlign:"center"}}>
<div style={{fontWeight:800}}>👩‍💼 Lady Voice - MIC FIXED!</div>
<div style={{marginTop:"10px"}}><button onClick={startRec} style={{width:"70px",height:"70px",borderRadius:"50%",background:rec?"#ef4444":"#fff",color:rec?"#fff":"#7c3aed",border:"none",fontSize:"28px",cursor:"pointer"}}>{rec?"■":"🎤"}</button></div>
<div style={{marginTop:"8px",fontSize:"11px"}}>{rec?"🔴 LISTENING...":"Click mic"}</div>
</div>
</div>
</div></div>
);
}
