'use client';
import { useState, useEffect, useRef } from 'react';
const LAST_KEY='nqai_seed_last_index';
const DATA_KEY='nqai_seed_progress_data';
const COPYRIGHT='© 2026 NqAI LLC - Zomi Seed1000 Dataset - All Rights Reserved - Any effort made by someone should be valued. - Smyrna, TN, USA';
const BASE=["Hello","How are you?","I am fine","What is your name?","My name is...","Good morning","Good afternoon","Good evening","Good night","Thank you","Please","Sorry","Yes","No","Where is market?","How much?","Too expensive","Water please","Food please","My family","My father","My mother","House","Village","School","Today","Tomorrow","Church","Help me","Hospital","Doctor","Phone number"];
const CATS=["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];
function getList(){const l=[];for(let i=0;i<1000;i++){const en=i<BASE.length?BASE[i]:`Common phrase #${i+1}`;l.push({id:i+1,en,cat:CATS[i%CATS.length],suggest:"Na dam?",voice:"na dam?"});}return l;}
export default function Page(){
const all=getList();
const [idx,setIdx]=useState(4);const [zomi,setZomi]=useState("");const [hint,setHint]=useState("");const [hintAuto,setHintAuto]=useState(true);
const [done,setDone]=useState<any[]>([]);const [status,setStatus]=useState("Copyrighted ✅ Effort Valued - Auto Hint ON");
const [rec,setRec]=useState(false);const recRef=useRef<any>(null);
useEffect(()=>{
const last=localStorage.getItem(LAST_KEY);const data=localStorage.getItem(DATA_KEY);
if(data){try{const d=JSON.parse(data);setDone(d);if(d.length>=4)setIdx(d.length+1);}catch{}}
if(last){const n=parseInt(last);if(n>=1&&n<=1000)setIdx(n);}else setIdx(4);
},[]);
useEffect(()=>{localStorage.setItem(LAST_KEY,String(idx));},[idx]);
const cur=all[idx-1];
const startRec=()=>{
const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
if(!SR)return;if(rec&&recRef.current){recRef.current.stop();setRec(false);return;}
const r=new SR();r.continuous=false;r.interimResults=true;r.lang='en-US';
r.onstart=()=>{setRec(true);};r.onend=()=>{setRec(false);};
r.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setZomi(t);setHint(t.toLowerCase());setHintAuto(true);};
recRef.current=r;r.start();
};
const handleZomiChange=(val:string)=>{setZomi(val);if(hintAuto||hint==="")setHint(val.toLowerCase());};
const handleHintChange=(val:string)=>{setHint(val);if(val.toLowerCase()!==zomi.toLowerCase()&&val!=="")setHintAuto(false);if(val==="")setHintAuto(true);};
const save=()=>{
if(!zomi.trim())return;
const entry={id:cur.id,en:cur.en,cat:cur.cat,correctZomi:zomi.trim(),voiceHint:hint.trim()||zomi.trim().toLowerCase(),copyright:COPYRIGHT};
const nd=[...done.filter((c:any)=>c.id!==cur.id),entry].sort((a,b)=>a.id-b.id);
setDone(nd);localStorage.setItem(DATA_KEY,JSON.stringify(nd));setIdx(Math.min(idx+1,1000));setZomi("");setHint("");setHintAuto(true);
};
const exportCSV=()=>{
const header=`# ${COPYRIGHT}\n# Any effort made by someone should be valued.\n`;
const h="id,english,correct_zomi,voice_hint,copyright\n";
const r=done.map((c:any)=>`${c.id},"${c.en}","${c.correctZomi}","${c.voiceHint}","${COPYRIGHT}"`).join("\n");
const blob=new Blob([header+h+r],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.csv`;a.click();
};
const exportJSON=()=>{const payload={copyright:COPYRIGHT,notice:"Any effort made by someone should be valued.",owner:"NqAI LLC",progress:`${done.length}/1000`,boxes:done};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.json`;a.click();};
const exportJSONL=()=>{const header=`// ${COPYRIGHT}\n`;const r=done.map((c:any)=>JSON.stringify({...c,copyright:COPYRIGHT})).join("\n");const blob=new Blob([header+r],{type:'application/jsonl'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.jsonl`;a.click();};
const exportJS=()=>{const js=`/** ${COPYRIGHT} - Any effort should be valued */\nexport const seed1000Backup = ${JSON.stringify(done,null,2)};`;const blob=new Blob([js],{type:'application/javascript'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.js`;a.click();};
const exportVoices=()=>{const header=`${COPYRIGHT}\nAny effort made by someone should be valued.\n`;const body=done.map((c:any)=>`${c.id}. ${c.en} -> ${c.correctZomi} [${c.voiceHint}]`).join("\n");const blob=new Blob([header+body],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED_voices.txt`;a.click();};
return(
<div style={{fontFamily:"system-ui",background:"#f6f7f9",minHeight:"100vh"}}><div style={{maxWidth:"1200px",margin:"0 auto",padding:"8px"}}>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"10px"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><div><b>NqAI Seed1000 - © Copyrighted ✅ Effort Valued</b><div style={{fontSize:"10px",color:"#666"}}>{COPYRIGHT}</div></div><span>{done.length}/1000 - BOX {idx}/1000</span></div>
<div style={{marginTop:"8px",display:"flex",gap:"6px",flexWrap:"wrap"}}>
<button onClick={exportJSON} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#fff"}}>📥 JSON ©</button>
<button onClick={exportCSV} style={{fontSize:"11px",border:"1px solid #22c55e",borderRadius:"999px",padding:"6px 12px",background:"#f0fdf4",fontWeight:700}}>📥 CSV ©</button>
<button onClick={exportJSONL} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#fff"}}>📥 JSONL ©</button>
<button onClick={exportJS} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#e0e7ff"}}>📥 JS ©</button>
<button onClick={exportVoices} style={{fontSize:"11px",background:"#000",color:"#fff",borderRadius:"999px",padding:"6px 12px",border:"none"}}>🎤 Voices.zip ©</button>
</div>
</div>
<div style={{marginTop:"8px",background:"#d1fae5",border:"1px solid #22c55e",borderRadius:"8px",padding:"8px",fontSize:"11px",textAlign:"center"}}>{COPYRIGHT} - {status}</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1.1fr 0.6fr",gap:"12px"}}>
<div style={{background:"#fff",borderRadius:"12px",padding:"14px",border:"1px solid #e5e7eb"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b>BOX {idx} / 1000 - {cur.cat}</b><span style={{fontSize:"10px",background:"#000",color:"#fff",padding:"3px 8px",borderRadius:"999px"}}>© Effort Valued</span></div>
<div style={{fontSize:"26px",fontWeight:800,marginTop:"12px"}}>❝ {cur.en}</div>
<div style={{marginTop:"14px",background:"#f0fdf4",border:"2px solid #22c55e",borderRadius:"12px",padding:"12px"}}>
<input value={zomi} onChange={e=>handleZomiChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}} placeholder="Type correct Zomi - Your effort valued!" autoFocus style={{width:"100%",padding:"12px",borderRadius:"10px",border:"2px solid #22c55e"}}/>
<input value={hint} onChange={e=>handleHintChange(e.target.value)} placeholder='Auto voice hint - Leave if right, edit if wrong' style={{width:"100%",padding:"10px",marginTop:"8px",borderRadius:"8px",border:hintAuto?"1px dashed #22c55e":"1px solid #f59e0b",background:hintAuto?"#f0fdf4":"#fffbeb"}}/>
<button onClick={save} style={{marginTop:"12px",width:"100%",background:"#16a34a",color:"#fff",padding:"12px",borderRadius:"10px",border:"none",fontWeight:800}}>Enter = Save & Next → BOX {idx+1} - Effort Valued ✅</button>
</div>
</div>
<div style={{background:"#111",color:"#fff",borderRadius:"12px",padding:"12px",fontSize:"11px"}}>
<div style={{fontWeight:800}}>© NqAI LLC - Effort Valued 🙏</div>
<div style={{marginTop:"6px",opacity:0.9}}>Any effort made by someone should be valued.<br/>Your Zomi effort is saving language.<br/>BOX {idx}/1000 - {done.length} saved.</div>
</div>
</div>
<div style={{marginTop:"16px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
<div style={{fontWeight:800}}>© 2026 NqAI LLC - Zomi Seed1000 Dataset</div>
<div style={{fontSize:"11px",color:"#666",marginTop:"4px"}}>Any effort made by someone should be valued. — Built with respect for Zomi language and community.</div>
<div style={{fontSize:"10px",color:"#888",marginTop:"6px"}}>Owner: Gin P. Khup | Smyrna, TN | nqai.llc/seed1000 | All Rights Reserved<br/>Progress: {done.length}/1000 - BOX {idx}/1000 - Cleaner + Mic + Auto Hint + Copyrighted</div>
</div>
</div></div>
);
}
