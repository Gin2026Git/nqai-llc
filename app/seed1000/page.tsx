'use client';
import { useState, useEffect, useRef } from 'react';

const LAST_KEY = 'nqai_seed_last_index';
const DATA_KEY = 'nqai_seed_progress_data';

const BASE_PHRASES = [
  "Hello","Hi","How are you?","I am fine","What is your name?","My name is...","Where are you from?",
  "Good morning","Good afternoon","Good evening","Good night","See you later","Thank you","Thank you very much",
  "You are welcome","Please","Sorry","Excuse me","Yes","No","I don't know","I understand",
  "Where is the market?","How much is this?","This is expensive","Cheap please","I want to buy",
  "Water please","Food please","My family","My father","My mother","House","Village","School",
  "Today","Tomorrow","Yesterday","Church","Help me","Where is hospital?","I am sick"
];

function getList(){ 
  const list=[]; 
  for(let i=0;i<1000;i++){
    const en = i<BASE_PHRASES.length ? BASE_PHRASES[i] : `Common phrase #${i+1}`;
    list.push({id:i+1,en,cat:"Greetings",suggest:"Na dam?"});
  } 
  return list;
}

export default function Seed1000Page(){
  const all = getList();
  const [idx,setIdx]=useState(1);
  const [zomi,setZomi]=useState("");
  const [hint,setHint]=useState("");
  const [done,setDone]=useState<any[]>([]);
  const [status,setStatus]=useState("Ready");

  useEffect(()=>{
    const sIdx=localStorage.getItem(LAST_KEY);
    const sData=localStorage.getItem(DATA_KEY);
    if(sData){ try{ setDone(JSON.parse(sData)); }catch{} }
    if(sIdx){ 
      const n=parseInt(sIdx); 
      if(n>=1){ setIdx(n); setStatus(`Resumed ${n}/1000 ✅`); }
    } else if(sData){
      try{ const d=JSON.parse(sData); if(d.length>0){ setIdx(d.length+1); } }catch{}
    }
  },[]);

  useEffect(()=>{ localStorage.setItem(LAST_KEY,String(idx)); },[idx]);

  const cur=all[idx-1];
  const save=()=>{
    if(!zomi.trim()){ setStatus("Type Zomi first!"); return; }
    const entry={id:cur.id,en:cur.en,correctZomi:zomi,voiceHint:hint||zomi,suggest:cur.suggest,cat:cur.cat};
    const nd=[...done.filter(c=>c.id!==cur.id),entry].sort((a,b)=>a.id-b.id);
    setDone(nd); localStorage.setItem(DATA_KEY,JSON.stringify(nd));
    setIdx(Math.min(idx+1,1000)); setZomi(""); setHint(""); setStatus(`Saved ${cur.id} ✅ ${nd.length}/1000`);
  };

  return (
    <div style={{padding:"12px",fontFamily:"system-ui"}}>
      <div style={{background:"#fff",border:"1px solid #eee",borderRadius:"12px",padding:"12px",display:"flex",justifyContent:"space-between"}}>
        <b>NqAI Seed1000 FAST Builder - Resume Fixed</b>
        <span>Ready - {done.length}/1000 done - Enter = Save & Next</span>
      </div>
      <div style={{marginTop:"12px",background:"#fef9c3",padding:"10px",borderRadius:"10px"}}>
        Fast Mode: English Pre-filled! Current: {done.length}/1000 - BOX {idx}/1000 — Auto-resume ON! No more 1/1000 reset!
      </div>
      <div style={{marginTop:"12px",background:"#fff",border:"1px solid #eee",borderRadius:"12px",padding:"12px"}}>
        <div style={{display:"flex",gap:"6px"}}>
          <button onClick={()=>setIdx(Math.max(1,idx-1))}>← Prev</button>
          <button onClick={()=>setIdx(Math.min(1000,idx+1))}>Skip →</button>
          <button onClick={()=>setIdx(done.length+1)} style={{background:"#7c3aed",color:"#fff",borderRadius:"999px",padding:"6px 12px",border:"none"}}>Resume {done.length+1}/1000 ▶️</button>
          <input type="number" placeholder="Go to #" onKeyDown={e=>{ if((e as any).key==='Enter'){ const n=parseInt((e.target as any).value); if(n>=1&&n<=1000) setIdx(n); }}} style={{width:"80px"}}/>
          <span>{status}</span>
        </div>
        <div style={{fontSize:"24px",fontWeight:800,marginTop:"12px"}}>❝ {cur.en}</div>
        <div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}>
          <div style={{background:"#f8fafc",padding:"10px",borderRadius:"8px"}}>SUGGESTED ZOMI: {cur.suggest}</div>
          <div style={{background:"#f0fdf4",padding:"10px",borderRadius:"8px"}}>SUGGESTED VOICE: {cur.suggest.toLowerCase()}</div>
        </div>
        <div style={{marginTop:"12px",background:"#f0fdf4",border:"2px solid #22c55e",borderRadius:"12px",padding:"12px"}}>
          <div style={{fontWeight:700,color:"#15803d"}}>YOUR CORRECT ZOMI (Green = Truth)</div>
          <input value={zomi} onChange={e=>setZomi(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') save(); }} placeholder="Type correct Zomi here - e.g. Tui koi ah om hiam?" style={{width:"100%",padding:"12px",marginTop:"6px",borderRadius:"10px",border:"1px solid #22c55e"}}/>
          <input value={hint} onChange={e=>setHint(e.target.value)} placeholder="Voice hint - na dam?" style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:"1px solid #ccc"}}/>
          <button onClick={save} style={{marginTop:"12px",width:"100%",background:"#16a34a",color:"#fff",padding:"12px",borderRadius:"10px",border:"none",fontWeight:800}}>Enter = Save & Next → BOX {idx+1}</button>
        </div>
        <div style={{marginTop:"10px",fontSize:"12px"}}>Completed last 10: {done.slice(-10).map(c=>`${c.id}. ${c.en}→${c.correctZomi}`).join(" | ")}</div>
      </div>
    </div>
  );
}
