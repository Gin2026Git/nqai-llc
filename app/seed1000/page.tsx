'use client';
import { useState, useEffect, useRef } from 'react';
const LAST_KEY='nqai_seed_last_index';const DATA_KEY='nqai_seed_progress_data';
const COPYRIGHT='© 2026 NqAI LLC - Zomi Seed1000 Dataset - All Rights Reserved - Any effort made by someone should be valued. - Smyrna, TN, USA';
const DB_NAME='NqAI_Seed1000_Audios';const STORE_NAME='audios';
const BASE=["Hello","How are you?","I am fine","What is your name?","My name is...","Good morning","Good afternoon","Good evening","Good night","Thank you","Please","Sorry","Yes","No","Where is market?","How much?","Too expensive","Water please","Food please","My family","My father","My mother","House","Village","School","Today","Tomorrow","Church","Help me","Hospital","Doctor","Phone number"];
const CATS=["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];
function getList(){const l=[];for(let i=0;i<1000;i++){const en=i<BASE.length?BASE[i]:`Common phrase #${i+1}`;l.push({id:i+1,en,cat:CATS[i%CATS.length]});}return l;}
function openDB():Promise<IDBDatabase>{return new Promise((res,rej)=>{const r=indexedDB.open(DB_NAME,1);r.onupgradeneeded=()=>{const db=r.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:'id'});};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function saveAudioToDB(id:number,blob:Blob,name:string,en:string,correct:string){try{const db=await openDB();const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).put({id,blob,name,en,correctZomi:correct,timestamp:new Date().toISOString(),copyright:COPYRIGHT});return true;}catch{return false;}}
async function getAllAudiosFromDB(){const db=await openDB();const tx=db.transaction(STORE_NAME,'readonly');return new Promise<any[]>((res,rej)=>{const r=tx.objectStore(STORE_NAME).getAll();r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function getAudioById(id:number){try{const db=await openDB();const tx=db.transaction(STORE_NAME,'readonly');return new Promise<any>((res,rej)=>{const r=tx.objectStore(STORE_NAME).get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}catch{return null;}}
async function getAudiosCount(){try{return (await getAllAudiosFromDB()).length;}catch{return 0;}}

export default function Page(){
const all=getList();
const [idx,setIdx]=useState(1);const [zomi,setZomi]=useState("");const [hint,setHint]=useState("");const [hintAuto,setHintAuto]=useState(true);
const [done,setDone]=useState<any[]>([]);const [status,setStatus]=useState("DAY 1 ZERO - BACK/FORWARD + Re-edit + Mic + Play + ZIP Ready");
const [rec,setRec]=useState(false);const [audioURL,setAudioURL]=useState<string|null>(null);const [hasAudio,setHasAudio]=useState(false);const [audiosCount,setAudiosCount]=useState(0);const [currentBlob,setCurrentBlob]=useState<Blob|null>(null);
const recRef=useRef<any>(null);const mediaRecorderRef=useRef<MediaRecorder|null>(null);const chunksRef=useRef<Blob[]>([]);const streamRef=useRef<MediaStream|null>(null);const audioPlayerRef=useRef<HTMLAudioElement|null>(null);

useEffect(()=>{
const last=localStorage.getItem(LAST_KEY);const data=localStorage.getItem(DATA_KEY);
if(data){try{const d=JSON.parse(data);setDone(d);}catch{}}
if(last){const n=parseInt(last);if(n>=1&&n<=1000)setIdx(n);}
getAudiosCount().then(c=>setAudiosCount(c));
},[]);
useEffect(()=>{localStorage.setItem(LAST_KEY,String(idx));},[idx]);

// BACK/FORWARD - Auto loads old data for re-edit
useEffect(()=>{
const entry=done.find((c:any)=>c.id===idx);
if(entry){
setZomi(entry.correctZomi||"");setHint(entry.voiceHint||"");setHintAuto(false);setHasAudio(!!entry.hasAudio);
if(entry.hasAudio){
getAudioById(idx).then(audioData=>{
if(audioData&&audioData.blob){
const url=URL.createObjectURL(audioData.blob);
setAudioURL(url);setCurrentBlob(audioData.blob);
setStatus(`📖 Loaded BOX ${idx} for RE-EDIT - Has audio - Click PLAY!`);
}else{
setAudioURL(null);setCurrentBlob(null);
setStatus(`📖 Loaded BOX ${idx} for RE-EDIT - Text only - Record new audio!`);
}
});
}else{
setAudioURL(null);setCurrentBlob(null);setStatus(`📖 Loaded BOX ${idx} for RE-EDIT - Edit and Save again!`);
}
}else{
setZomi("");setHint("");setHintAuto(true);setAudioURL(null);setCurrentBlob(null);setHasAudio(false);
setStatus(`New BOX ${idx} - Type or Record new Zomi!`);
}
},[idx,done]);

const cur=all[idx-1];
const goBack=()=>{if(idx>1)setIdx(idx-1);else setStatus("Already at BOX 1!");};
const goForward=()=>{if(idx<1000)setIdx(idx+1);else setStatus("Already at BOX 1000!");};

const startRec=async()=>{
if(rec){if(mediaRecorderRef.current&&mediaRecorderRef.current.state==="recording")mediaRecorderRef.current.stop();if(recRef.current){try{recRef.current.stop();}catch{}}setRec(false);return;}
try{
const stream=await navigator.mediaDevices.getUserMedia({audio:true});streamRef.current=stream;chunksRef.current=[];
const mr=new MediaRecorder(stream);mediaRecorderRef.current=mr;
mr.ondataavailable=(e)=>{if(e.data.size>0)chunksRef.current.push(e.data);};
mr.onstop=()=>{const blob=new Blob(chunksRef.current,{type:'audio/webm'});const url=URL.createObjectURL(blob);setAudioURL(url);setCurrentBlob(blob);setHasAudio(true);setStatus(`✅ Audio recorded! Click PLAY! Will be in ZIP!`);if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());};
mr.start();setHasAudio(false);setAudioURL(null);setCurrentBlob(null);setRec(true);setStatus("🔴 RECORDING... Speak Zomi!");
const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
if(SR){const r=new SR();r.continuous=false;r.interimResults=true;r.lang='en-US';r.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setZomi(t);setHint(t.toLowerCase());setHintAuto(true);};recRef.current=r;try{r.start();}catch{}}
}catch{alert("Allow Mic: Click lock → Allow → Reload");}
};
const playAudio=()=>{if(audioPlayerRef.current&&audioURL)audioPlayerRef.current.play();};
const handleZomiChange=(val:string)=>{setZomi(val);if(hintAuto||hint==="")setHint(val.toLowerCase());};
const handleHintChange=(val:string)=>{setHint(val);if(val.toLowerCase()!==zomi.toLowerCase()&&val!=="")setHintAuto(false);if(val==="")setHintAuto(true);};
const save=async()=>{
if(!zomi.trim())return;
const fileName=`BOX_${cur.id}_${cur.en.replace(/[^a-zA-Z0-9]/g,'_')}.webm`;
if(currentBlob&&hasAudio){await saveAudioToDB(cur.id,currentBlob,fileName,cur.en,zomi.trim());setAudiosCount(await getAudiosCount());}
const entry={id:cur.id,en:cur.en,cat:cur.cat,correctZomi:zomi.trim(),voiceHint:hint.trim()||zomi.trim().toLowerCase(),hasAudio:hasAudio,audioFile:hasAudio?fileName:'',copyright:COPYRIGHT};
const nd=[...done.filter((c:any)=>c.id!==cur.id),entry].sort((a,b)=>a.id-b.id);
setDone(nd);localStorage.setItem(DATA_KEY,JSON.stringify(nd));
setStatus(`Saved BOX ${cur.id} ✅ ${nd.length}/1000 - Effort Valued!`);
setIdx(Math.min(idx+1,1000));setZomi("");setHint("");setHintAuto(true);setAudioURL(null);setHasAudio(false);setCurrentBlob(null);
};
const resetToZero=async()=>{
if(!confirm("RESET TO ZERO - Delete all? Start BOX 1 tomorrow?"))return;
if(!confirm("Confirm again: Start from ZERO?"))return;
localStorage.removeItem(DATA_KEY);localStorage.removeItem(LAST_KEY);
try{const db=await openDB();const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).clear();}catch{}
indexedDB.deleteDatabase(DB_NAME);
setDone([]);setIdx(1);setZomi("");setHint("");setAudioURL(null);setHasAudio(false);setAudiosCount(0);setStatus("ZERO RESET DONE - BOX 1 Ready!");
alert("RESET DONE! BOX 1 Clean start tomorrow!");
};
const exportCSV=()=>{const h="id,english,correct,voice,has_audio,copyright\n";const r=done.map((c:any)=>`${c.id},"${c.en}","${c.correctZomi}","${c.voiceHint}","${c.hasAudio?'Yes':''}","${COPYRIGHT}"`).join("\n");const blob=new Blob([h+r],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.csv`;a.click();};
const exportJSON=()=>{const payload={copyright:COPYRIGHT,audiosCount:audiosCount,boxes:done};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.json`;a.click();};
const exportAudiosZip=async()=>{
const allAudios=await getAllAudiosFromDB();
if(allAudios.length===0){alert("No audios yet!");return;}
let JSZip:any;try{JSZip=(await import('jszip')).default;}catch{alert("Reload page - jszip already installed");return;}
const zip=new JSZip();zip.file('COPYRIGHT.txt',COPYRIGHT);zip.file('manifest.json',JSON.stringify({copyright:COPYRIGHT,audiosCount:allAudios.length,boxes:done},null,2));
const folder=zip.folder('audios');allAudios.forEach((it:any)=>{if(it.blob)folder.file(it.name,it.blob);});
const content=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(content);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${allAudios.length}_AUDIOS_COPYRIGHTED_SUPERPHONE_${new Date().toISOString().slice(0,10)}.zip`;a.click();
};
const isEdited=done.find((c:any)=>c.id===idx);
return(
<div style={{fontFamily:"system-ui",background:"#f6f7f9",minHeight:"100vh"}}><div style={{maxWidth:"1300px",margin:"0 auto",padding:"8px"}}>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"10px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"8px"}}>
<div><b>NqAI Seed1000 - ◀️ BACK / FORWARD ▶️ + Re-edit</b><div style={{fontSize:"10px",color:"#666"}}>{COPYRIGHT}</div></div>
<div style={{display:"flex",gap:"6px",alignItems:"center"}}>
<button onClick={goBack} style={{background:"#000",color:"#fff",border:"none",borderRadius:"999px",padding:"8px 14px",fontWeight:800,cursor:"pointer"}}>◀️ BACK</button>
<span style={{fontWeight:800,background:"#f3f4f6",padding:"6px 12px",borderRadius:"999px"}}>BOX {idx} / 1000</span>
<button onClick={goForward} style={{background:"#000",color:"#fff",border:"none",borderRadius:"999px",padding:"8px 14px",fontWeight:800,cursor:"pointer"}}>FORWARD ▶️</button>
</div>
<div style={{fontWeight:800}}>{done.length}/1000 - 🎤 {audiosCount} audios</div>
</div>
<div style={{marginTop:"8px",display:"flex",gap:"6px",flexWrap:"wrap"}}>
<button onClick={exportJSON} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#fff"}}>📥 JSON ©</button>
<button onClick={exportCSV} style={{fontSize:"11px",border:"1px solid #22c55e",borderRadius:"999px",padding:"6px 12px",background:"#f0fdf4",fontWeight:700}}>📥 CSV ©</button>
<button onClick={exportAudiosZip} style={{fontSize:"11px",background:"#7c3aed",color:"#fff",borderRadius:"999px",padding:"8px 14px",border:"none",fontWeight:800}}>📦 Audios ZIP © - {audiosCount}</button>
<button onClick={resetToZero} style={{fontSize:"11px",background:"#ef4444",color:"#fff",borderRadius:"999px",padding:"6px 12px",border:"none",fontWeight:700}}>🗑️ RESET ZERO</button>
</div>
</div>
<div style={{marginTop:"8px",background:isEdited?"#fef9c3":hasAudio?"#dbeafe":"#d1fae5",border:"1px solid",borderColor:isEdited?"#f59e0b":hasAudio?"#3b82f6":"#22c55e",borderRadius:"8px",padding:"8px",fontSize:"11px",fontWeight:700,textAlign:"center"}}>
{isEdited?`📖 RE-EDIT MODE - BOX ${idx} saved before - Edit again! - ${status}`:rec?`🔴 RECORDING BOX ${idx}`:hasAudio?`✅ Audio ready BOX ${idx} - ${status}`:`BOX ${idx} - ${status}`}
</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1.2fr 0.6fr",gap:"12px"}}>
<div>
<div style={{background:"#fff",borderRadius:"12px",padding:"14px",border:"1px solid #e5e7eb",borderLeft:isEdited?"6px solid #f59e0b":"6px solid #22c55e"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{display:"flex",gap:"8px",alignItems:"center"}}>
<button onClick={goBack} style={{background:"#f3f4f6",border:"1px solid #ddd",borderRadius:"50%",width:"36px",height:"36px",fontSize:"16px",cursor:"pointer",fontWeight:800}}>◀️</button>
<b>BOX {idx} / 1000 - {cur.cat} {isEdited?"- EDITING!":""}</b>
<button onClick={goForward} style={{background:"#f3f4f6",border:"1px solid #ddd",borderRadius:"50%",width:"36px",height:"36px",fontSize:"16px",cursor:"pointer",fontWeight:800}}>▶️</button>
</div>
<span style={{fontSize:"10px",background:isEdited?"#f59e0b":hasAudio?"#3b82f6":"#000",color:"#fff",padding:"3px 8px",borderRadius:"999px"}}>{isEdited?"📝 RE-EDIT":hasAudio?"🎤 Audio":"© Effort"}</span>
</div>
<div style={{fontSize:"26px",fontWeight:800,marginTop:"12px"}}>❝ {cur.en}</div>
{isEdited&&<div style={{marginTop:"8px",fontSize:"11px",background:"#fffbeb",border:"1px dashed #f59e0b",padding:"6px 10px",borderRadius:"8px"}}>⚠️ Saved before: <b>{isEdited.correctZomi}</b> - Edit and Save again!</div>}
<div style={{marginTop:"14px",background:"#f0fdf4",border:"2px solid #22c55e",borderRadius:"12px",padding:"12px"}}>
<input value={zomi} onChange={e=>handleZomiChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}} placeholder={isEdited?"Edit previous Zomi - Fix!":"Type correct Zomi!"} autoFocus style={{width:"100%",padding:"12px",marginTop:"8px",borderRadius:"10px",border:isEdited?"2px solid #f59e0b":"2px solid #22c55e",fontSize:"15px",background:isEdited?"#fffbeb":"#fff"}}/>
<div style={{display:"flex",gap:"6px",marginTop:"8px",alignItems:"center"}}>
<input value={hint} onChange={e=>handleHintChange(e.target.value)} placeholder='Voice hint' style={{flex:1,padding:"10px",borderRadius:"8px",border:"1px solid #ddd"}}/>
<button onClick={startRec} style={{background:rec?"#ef4444":"#16a34a",color:"#fff",border:"none",borderRadius:"999px",padding:"10px 16px",fontWeight:800,cursor:"pointer",minWidth:"110px"}}>{rec?"● STOP":"● RECORD"}</button>
{hasAudio&&audioURL&&<button onClick={playAudio} style={{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"999px",padding:"10px 16px",fontWeight:800,cursor:"pointer"}}>▶️ PLAY</button>}
</div>
{hasAudio&&audioURL&&<div style={{marginTop:"8px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"8px",padding:"8px"}}><audio ref={audioPlayerRef} src={audioURL} controls style={{width:"100%",height:"32px"}}/></div>}
<div style={{display:"flex",gap:"6px",marginTop:"12px"}}>
<button onClick={goBack} style={{flex:1,background:"#fff",border:"1px solid #ddd",padding:"12px",borderRadius:"10px",fontWeight:700,cursor:"pointer"}}>◀️ BACK</button>
<button onClick={save} style={{flex:2,background:isEdited?"#f59e0b":"#16a34a",color:"#fff",padding:"12px",borderRadius:"10px",border:"none",fontWeight:800,cursor:"pointer"}}>{isEdited?"✏️ UPDATE → BOX "+(idx+1):"Save & Next → BOX "+(idx+1)}</button>
<button onClick={goForward} style={{flex:1,background:"#fff",border:"1px solid #ddd",padding:"12px",borderRadius:"10px",fontWeight:700,cursor:"pointer"}}>FORWARD ▶️</button>
</div>
<div style={{fontSize:"10px",color:"#666",textAlign:"center",marginTop:"6px"}}>💡 BACK to re-edit any saved BOX - Auto loads old text + audio!</div>
</div>
</div>
</div>
<div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
<div style={{background:"#fff",borderRadius:"12px",padding:"12px",border:"1px solid #e5e7eb"}}>
<div style={{fontWeight:700,fontSize:"13px"}}>📊 {done.length}/1000 - {audiosCount} audios - BOX {idx}</div>
<div style={{height:"8px",background:"#f3f4f6",borderRadius:"999px",marginTop:"8px"}}><div style={{width:`${(done.length/1000)*100}%`,height:"100%",background:"#22c55e",borderRadius:"999px"}}></div></div>
<div style={{marginTop:"8px",display:"flex",gap:"4px"}}>
<button onClick={goBack} style={{flex:1,background:"#000",color:"#fff",border:"none",padding:"8px",borderRadius:"8px",fontWeight:700,cursor:"pointer"}}>◀️ BACK</button>
<button onClick={goForward} style={{flex:1,background:"#000",color:"#fff",border:"none",padding:"8px",borderRadius:"8px",fontWeight:700,cursor:"pointer"}}>FORWARD ▶️</button>
</div>
<div style={{marginTop:"8px",fontSize:"11px",background:"#fef9c3",padding:"8px",borderRadius:"6px",border:"1px solid #fde68a"}}>
<b>NEW: Re-edit with arrows!</b><br/>
• ◀️ BACK → BOX 6,5,4...<br/>
• Auto loads old Zomi + audio<br/>
• Fix → Save again → Updates!<br/>
• ▶️ FORWARD → Next BOX<br/>
</div>
</div>
</div>
</div>
</div></div>
);
}
