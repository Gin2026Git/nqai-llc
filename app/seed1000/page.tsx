'use client';
import { useState, useEffect, useRef } from 'react';
const LAST_KEY='nqai_seed_last_index';
const DATA_KEY='nqai_seed_progress_data';
const BASE=["Hello","Hi","How are you?","I am fine","What is your name?","My name is...","Where are you from?","Good morning","Good afternoon","Good evening","Good night","See you later","Thank you","Thank you very much","You are welcome","Please","Sorry","Excuse me","Yes","No","I don't know","I understand","I don't understand","Where is the market?","How much is this?","This is expensive","Cheap please","I want to buy","Water please","Food please","My family","My father","My mother","My brother","My sister","House","Village","School","What time is it?","Today","Tomorrow","Yesterday","Church","Prayer","Help me","I need help","Call the doctor","Where is the hospital?","I am sick","My phone number is...","What is your phone number?"];
const CATS=["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];
function getList(){const l=[];for(let i=0;i<1000;i++){const en=i<BASE.length?BASE[i]:`Common phrase #${i+1} - Replace with real English`;l.push({id:i+1,en,cat:CATS[i%CATS.length],suggest:"Na dam?"});}return l;}
export default function Page(){
const all=getList();
const [idx,setIdx]=useState(1);
const [zomi,setZomi]=useState("");
const [hint,setHint]=useState("");
const [done,setDone]=useState<any[]>([]);
const [status,setStatus]=useState("Ready");
const [recording,setRecording]=useState(false);
const recRef=useRef<any>(null);
useEffect(()=>{
const sIdx=localStorage.getItem(LAST_KEY);
const sData=localStorage.getItem(DATA_KEY);
if(sData){try{setDone(JSON.parse(sData));}catch{}}
if(sIdx){const n=parseInt(sIdx);if(n>=1&&n<=1000){setIdx(n);setStatus(`Resumed from ${n}/1000 ✅`);}}
},[]);
useEffect(()=>{localStorage.setItem(LAST_KEY,String(idx));},[idx]);
const cur=all[idx-1];
const save=()=>{
if(!zomi.trim())return;
const entry={id:cur.id,en:cur.en,cat:cur.cat,suggest:cur.suggest,correctZomi:zomi.trim(),voiceHint:hint||zomi.trim().toLowerCase()};
const nd=[...done.filter(c=>c.id!==cur.id),entry].sort((a,b)=>a.id-b.id);
setDone(nd);localStorage.setItem(DATA_KEY,JSON.stringify(nd));
setIdx(Math.min(idx+1,1000));setZomi("");setHint("");
};
const exportCSV=()=>{const h="id,english,category,suggested,correct,voice\n";const r=done.map(c=>`${c.id},"${c.en}","${c.cat}","${c.suggest}","${c.correctZomi}","${c.voiceHint}"`).join("\n");const b=new Blob([h+r],{type:'text/csv'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`nqai_seed1000_${done.length}.csv`;a.click();};
return(
<div style={{fontFamily:"system-ui",background:"#f8fafc",minHeight:"100vh",padding:"10px"}}>
<div style={{maxWidth:"1300px",margin:"0 auto"}}>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"10px",display:"flex",justifyContent:"space-between"}}>
<b>NqAI Seed1000 FAST Builder - Lady Front Desk Converter VISIBLE</b>
<span style={{background:"#f3f0ff",padding:"6px 10px",borderRadius:"999px",fontSize:"12px"}}>Ready - {done.length}/1000 done - Enter = Save & Next</span>
<button onClick={exportCSV} style={{border:"1px solid #ddd",borderRadius:"999px",padding:"6px 10px"}}>CSV</button>
<button onClick={()=>setIdx(done.length+1)} style={{background:"#7c3aed",color:"#fff",borderRadius:"999px",padding:"6px 12px",border:"none"}}>Resume {done.length+1}/1000 ▶️</button>
</div>
<div style={{marginTop:"8px",background:"#fef9c3",borderRadius:"10px",padding:"8px",fontSize:"12px"}}>⚡ Fast Mode: English Pre-filled - Auto-resume ON! BOX {idx}/1000 - {status}</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1.6fr 0.7fr",gap:"12px"}}>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"12px"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b>BOX {idx} / 1000</b><span>{cur.cat}</span><div style={{display:"flex",gap:"6px"}}><button onClick={()=>setIdx(Math.max(1,idx-1))}>Prev</button><button onClick={()=>setIdx(Math.min(1000,idx+1))}>Skip</button><input type="number" placeholder="Go to #" onKeyDown={e=>{if((e as any).key==='Enter'){const n=parseInt((e.target as any).value);if(n>=1&&n<=1000)setIdx(n);}}} style={{width:"70px"}}/></div></div>
<div style={{fontSize:"24px",fontWeight:800,marginTop:"10px"}}>❝ {cur.en}</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
<div style={{background:"#f8fafc",padding:"10px",borderRadius:"8px"}}>SUGGESTED ZOMI: {cur.suggest}</div>
<div style={{background:"#f0fdf4",padding:"10px",borderRadius:"8px"}}>VOICE: {cur.suggest.toLowerCase()}</div>
</div>
<div style={{marginTop:"12px",background:"#f0fdf4",border:"2px solid #22c55e",borderRadius:"12px",padding:"12px"}}>
<div style={{fontWeight:700,color:"#15803d",fontSize:"11px"}}>✅ YOUR CORRECT ZOMI SPELLING (Green = Truth)</div>
<input value={zomi} onChange={e=>setZomi(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}} placeholder="Type correct Zomi - e.g. Tui koi ah om hiam?" style={{width:"100%",padding:"12px",marginTop:"6px",borderRadius:"10px",border:"1px solid #22c55e"}}/>
<input value={hint} onChange={e=>setHint(e.target.value)} placeholder="Voice hint - na dam?" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc"}}/>
<button onClick={save} style={{marginTop:"10px",width:"100%",background:"#16a34a",color:"#fff",padding:"12px",borderRadius:"10px",border:"none",fontWeight:800}}>Enter = Save & Next → BOX {idx+1}</button>
</div>
</div>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"12px"}}>
<div style={{fontWeight:700}}>Dataset Progress {done.length}/1000</div>
<div style={{height:"8px",background:"#f3f4f6",borderRadius:"999px",marginTop:"6px"}}><div style={{width:`${(done.length/1000)*100}%`,height:"100%",background:"#22c55e",borderRadius:"999px"}}></div></div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px",fontSize:"11px"}}>{CATS.map(cat=>{const c=done.filter(d=>d.cat===cat).length;return(<div key={cat} style={{border:"1px solid #eee",borderRadius:"8px",padding:"6px"}}>{cat}<br/><b>{c}/125</b></div>);})}</div>
<div style={{marginTop:"10px",fontSize:"11px",maxHeight:"260px",overflow:"auto",border:"1px solid #eee",borderRadius:"8px",padding:"6px"}}>{done.length===0?<div>No completed yet</div>:done.slice(-30).reverse().map(c=><div key={c.id}>{c.id}. {c.en} → {c.correctZomi}</div>)}</div>
</div>
</div>
</div>
</div>
);
}
