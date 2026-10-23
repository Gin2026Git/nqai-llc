'use client';
import { useState, useEffect, useRef } from 'react';
const LAST_KEY='nqai_seed_last_index';
const DATA_KEY='nqai_seed_progress_data';
const BASE=["Hello","How are you?","I am fine","What is your name?","My name is...","Good morning","Good afternoon","Good evening","Good night","Thank you","Please","Sorry","Yes","No","Where is market?","How much?","Too expensive","Water please","Food please","My family","My father","My mother","My house","Village","School","Today","Tomorrow","Church","Help me","Hospital","Doctor","Phone number"];
const CATS=["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];
function getList(){const l=[];for(let i=0;i<1000;i++){const en=i<BASE.length?BASE[i]:`Common phrase #${i+1}`;l.push({id:i+1,en,cat:CATS[i%CATS.length],suggest:"Na dam?"});}return l;}
export default function Page(){
const all=getList();
const [idx,setIdx]=useState(1);
const [zomi,setZomi]=useState("");
const [hint,setHint]=useState("");
const [done,setDone]=useState<any[]>([]);
const [status,setStatus]=useState("Ready");
const [rec,setRec]=useState(false);
const recRef=useRef<any>(null);
useEffect(()=>{
const last=localStorage.getItem(LAST_KEY);
const data=localStorage.getItem(DATA_KEY);
if(data){try{setDone(JSON.parse(data));}catch{}}
if(last){const n=parseInt(last);if(n>=1&&n<=1000){setIdx(n);setStatus(`Resumed ${n}/1000 ✅`);}}
},[]);
useEffect(()=>{localStorage.setItem(LAST_KEY,String(idx));},[idx]);
const cur=all[idx-1];
const save=()=>{
if(!zomi.trim())return;
const entry={id:cur.id,en:cur.en,cat:cur.cat,suggest:cur.suggest,correctZomi:zomi.trim(),voiceHint:hint||zomi.trim().toLowerCase()};
const nd=[...done.filter((c:any)=>c.id!==cur.id),entry].sort((a,b)=>a.id-b.id);
setDone(nd);localStorage.setItem(DATA_KEY,JSON.stringify(nd));
setIdx(Math.min(idx+1,1000));setZomi("");setHint("");setStatus(`Saved ${cur.id} ✅ ${nd.length}/1000`);
};
const exportCSV=()=>{const h="id,english,category,suggested,correct,voice\n";const r=done.map((c:any)=>`${c.id},"${c.en}","${c.cat}","${c.suggest}","${c.correctZomi}","${c.voiceHint}"`).join("\n");const blob=new Blob([h+r],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}.csv`;a.click();};
return(
<div style={{fontFamily:"system-ui",background:"#f6f7f9",minHeight:"100vh"}}>
<div style={{maxWidth:"1400px",margin:"0 auto",padding:"8px"}}>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"10px",display:"flex",justifyContent:"space-between"}}>
<b>NqAI Seed1000 FAST Builder - Lady Front Desk Converter VISIBLE</b>
<span>Ready - {done.length}/1000 done</span>
<button onClick={exportCSV}>CSV</button>
<button onClick={()=>setIdx(done.length+1)} style={{background:"#7c3aed",color:"#fff",borderRadius:"999px",padding:"6px 12px",border:"none"}}>Resume {done.length+1}/1000 ▶️</button>
</div>
<div style={{marginTop:"8px",background:"#fef9c3",borderRadius:"8px",padding:"8px",fontSize:"12px"}}>⚡ Fast Mode: English Pre-filled - BOX {idx}/1000 - Auto-resume ON! {status}</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1.7fr 0.8fr",gap:"12px"}}>
<div style={{background:"#fff",borderRadius:"12px",padding:"14px",border:"1px solid #e5e7eb"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b>BOX {idx} / 1000 - {cur.cat}</b><div><button onClick={()=>setIdx(Math.max(1,idx-1))}>Prev</button><button onClick={()=>setIdx(Math.min(1000,idx+1))}>Skip</button><input type="number" placeholder="Go to #" onKeyDown={(e:any)=>{if(e.key==='Enter'){const n=parseInt(e.target.value);if(n>=1&&n<=1000)setIdx(n);}}} style={{width:"65px"}}/></div></div>
<div style={{fontSize:"28px",fontWeight:800,marginTop:"10px"}}>❝ {cur.en}</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
<div style={{background:"#fffbeb",padding:"10px",borderRadius:"10px",border:"1px solid #fde68a"}}>SUGGESTED ZOMI: {cur.suggest}</div>
<div style={{background:"#f0fdf4",padding:"10px",borderRadius:"10px"}}>VOICE: {cur.suggest.toLowerCase()}</div>
</div>
<div style={{marginTop:"14px",background:"#f0fdf4",border:"2px solid #22c55e",borderRadius:"12px",padding:"12px"}}>
<div style={{fontWeight:700,color:"#15803d",fontSize:"11px"}}>✅ YOUR CORRECT ZOMI SPELLING (Green = Your Truth)</div>
<input value={zomi} onChange={e=>setZomi(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}} placeholder="Type correct Zomi here - e.g. Tui koi ah om hiam?" style={{width:"100%",padding:"12px",marginTop:"6px",borderRadius:"10px",border:"1px solid #22c55e"}}/>
<input value={hint} onChange={e=>setHint(e.target.value)} placeholder="Voice hint" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc"}}/>
<button onClick={save} style={{marginTop:"12px",width:"100%",background:"#16a34a",color:"#fff",padding:"12px",borderRadius:"10px",border:"none",fontWeight:800}}>Enter = Save & Next → BOX {idx+1}</button>
</div>
</div>
<div style={{background:"#fff",borderRadius:"12px",padding:"12px",border:"1px solid #e5e7eb"}}>
<div style={{fontWeight:700}}>Dataset Progress {done.length}/1000</div>
<div style={{height:"8px",background:"#f3f4f6",borderRadius:"999px",marginTop:"6px"}}><div style={{width:`${(done.length/1000)*100}%`,height:"100%",background:"#22c55e",borderRadius:"999px"}}></div></div>
<div style={{marginTop:"10px"}}>{CATS.map(cat=>{const c=done.filter((d:any)=>d.cat===cat).length;return(<div key={cat} style={{border:"1px solid #eee",borderRadius:"8px",padding:"6px",fontSize:"11px",marginBottom:"4px"}}>{cat} - {c}/125</div>);})}</div>
</div>
</div>
</div>
</div>
);
}
