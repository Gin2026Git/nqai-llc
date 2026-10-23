'use client';
import { useState, useEffect, useRef } from 'react';
const LAST_KEY='nqai_seed_last_index';
const DATA_KEY='nqai_seed_progress_data';
const COPYRIGHT='© 2026 NqAI LLC - Zomi Seed1000 Dataset - All Rights Reserved - Any effort made by someone should be valued. - Smyrna, TN, USA';
const DB_NAME='NqAI_Seed1000_Audios';const STORE_NAME='audios';
const BASE=["Hello","How are you?","I am fine","What is your name?","My name is...","Good morning","Good afternoon","Good evening","Good night","Thank you","Please","Sorry","Yes","No","Where is market?","How much?","Too expensive","Water please","Food please","My family","My father","My mother","House","Village","School","Today","Tomorrow","Church","Help me","Hospital","Doctor","Phone number"];
const CATS=["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];
function getList(){const l=[];for(let i=0;i<1000;i++){const en=i<BASE.length?BASE[i]:`Common phrase #${i+1}`;l.push({id:i+1,en,cat:CATS[i%CATS.length],suggest:"Na dam?",voice:"na dam?"});}return l;}
function openDB():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE_NAME))db.createObjectStore(STORE_NAME,{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function saveAudioToDB(id:number,blob:Blob,name:string,en:string,correct:string){try{const db=await openDB();const tx=db.transaction(STORE_NAME,'readwrite');tx.objectStore(STORE_NAME).put({id,blob,name,en,correctZomi:correct,timestamp:new Date().toISOString(),copyright:COPYRIGHT});return true;}catch{return false;}}
async function getAllAudiosFromDB():Promise<any[]>{const db=await openDB();const tx=db.transaction(STORE_NAME,'readonly');return new Promise((resolve,reject)=>{const req=tx.objectStore(STORE_NAME).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function getAudiosCount(){try{const all=await getAllAudiosFromDB();return all.length;}catch{return 0;}}
export default function Page(){
const all=getList();
const [idx,setIdx]=useState(6);const [zomi,setZomi]=useState("");const [hint,setHint]=useState("");const [hintAuto,setHintAuto]=useState(true);
const [done,setDone]=useState<any[]>([]);const [status,setStatus]=useState("Mic + Play + Audios ZIP for Super Phone ✅");
const [rec,setRec]=useState(false);const [audioURL,setAudioURL]=useState<string|null>(null);const [hasAudio,setHasAudio]=useState(false);const [audiosCount,setAudiosCount]=useState(0);const [currentBlob,setCurrentBlob]=useState<Blob|null>(null);
const recRef=useRef<any>(null);const mediaRecorderRef=useRef<MediaRecorder|null>(null);const chunksRef=useRef<Blob[]>([]);const streamRef=useRef<MediaStream|null>(null);const audioPlayerRef=useRef<HTMLAudioElement|null>(null);
useEffect(()=>{const last=localStorage.getItem(LAST_KEY);const data=localStorage.getItem(DATA_KEY);if(data){try{const d=JSON.parse(data);setDone(d);if(d.length>=6)setIdx(d.length+1);}catch{}}if(last){const n=parseInt(last);if(n>=1&&n<=1000)setIdx(n);}else setIdx(6);getAudiosCount().then(c=>setAudiosCount(c));},[]);
useEffect(()=>{localStorage.setItem(LAST_KEY,String(idx));},[idx]);
const cur=all[idx-1];
const startRec=async()=>{
if(rec){if(mediaRecorderRef.current&&mediaRecorderRef.current.state==="recording")mediaRecorderRef.current.stop();if(recRef.current){try{recRef.current.stop();}catch{}}setRec(false);return;}
try{
const stream=await navigator.mediaDevices.getUserMedia({audio:true});streamRef.current=stream;chunksRef.current=[];
const mr=new MediaRecorder(stream);mediaRecorderRef.current=mr;
mr.ondataavailable=(e)=>{if(e.data.size>0)chunksRef.current.push(e.data);};
mr.onstop=()=>{const blob=new Blob(chunksRef.current,{type:'audio/webm'});const url=URL.createObjectURL(blob);setAudioURL(url);setCurrentBlob(blob);setHasAudio(true);setStatus(`✅ Audio recorded! Click ▶️ Play! For Audios ZIP!`);getAudiosCount().then(c=>setAudiosCount(c));if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());};
mr.start();setHasAudio(false);setAudioURL(null);setCurrentBlob(null);setRec(true);setStatus("🔴 RECORDING AUDIO + LISTENING... Speak Zomi!");
const SR=(window as any).SpeechRecognition||(window as any).webkitSpeechRecognition;
if(SR){const r=new SR();r.continuous=false;r.interimResults=true;r.lang='en-US';r.onresult=(e:any)=>{let t="";for(let i=e.resultIndex;i<e.results.length;i++)t+=e.results[i][0].transcript;setZomi(t);setHint(t.toLowerCase());setHintAuto(true);};recRef.current=r;try{r.start();}catch{}}
}catch{alert("Allow Mic: Click 🔒 → Allow → Reload");}
};
const playAudio=()=>{if(audioPlayerRef.current&&audioURL){audioPlayerRef.current.play();}};
const handleZomiChange=(val:string)=>{setZomi(val);if(hintAuto||hint==="")setHint(val.toLowerCase());};
const handleHintChange=(val:string)=>{setHint(val);if(val.toLowerCase()!==zomi.toLowerCase()&&val!=="")setHintAuto(false);if(val==="")setHintAuto(true);};
const save=async()=>{
if(!zomi.trim())return;
const fileName=`BOX_${cur.id}_${cur.en.replace(/[^a-zA-Z0-9]/g,'_')}_${zomi.trim().replace(/[^a-zA-Z0-9]/g,'_').slice(0,20)}.webm`;
if(currentBlob&&hasAudio){await saveAudioToDB(cur.id,currentBlob,fileName,cur.en,zomi.trim());const newCount=await getAudiosCount();setAudiosCount(newCount);}
const entry={id:cur.id,en:cur.en,cat:cur.cat,correctZomi:zomi.trim(),voiceHint:hint.trim()||zomi.trim().toLowerCase(),hasAudio:hasAudio,audioFile:hasAudio?fileName:'',copyright:COPYRIGHT};
const nd=[...done.filter((c:any)=>c.id!==cur.id),entry].sort((a,b)=>a.id-b.id);
setDone(nd);localStorage.setItem(DATA_KEY,JSON.stringify(nd));setIdx(Math.min(idx+1,1000));setZomi("");setHint("");setHintAuto(true);setAudioURL(null);setHasAudio(false);setCurrentBlob(null);
};
const exportCSV=()=>{const h="id,english,correct,voice,has_audio,audio_file,copyright\n";const r=done.map((c:any)=>`${c.id},"${c.en}","${c.correctZomi}","${c.voiceHint}","${c.hasAudio?'Yes':''}","${c.audioFile||''}","${COPYRIGHT}"`).join("\n");const blob=new Blob([h+r],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.csv`;a.click();};
const exportJSON=()=>{const payload={copyright:COPYRIGHT,notice:"Any effort made by someone should be valued.",audiosCount:audiosCount,boxes:done};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.json`;a.click();};
const exportJSONL=()=>{const r=done.map((c:any)=>JSON.stringify({...c,copyright:COPYRIGHT})).join("\n");const blob=new Blob([r],{type:'application/jsonl'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.jsonl`;a.click();};
const exportJS=()=>{const js=`/** ${COPYRIGHT} */\nexport const seed1000Backup = ${JSON.stringify(done,null,2)};`;const blob=new Blob([js],{type:'application/javascript'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED.js`;a.click();};
const exportVoices=async()=>{const allAudios=await getAllAudiosFromDB();const body=done.map((c:any)=>`${c.id}. ${c.en} -> ${c.correctZomi} Audio:${c.hasAudio?'Yes':'No'}`).join("\n");const blob=new Blob([`${COPYRIGHT}\n${body}`],{type:'text/plain'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${done.length}_COPYRIGHTED_voices.txt`;a.click();};
const exportAudiosZip=async()=>{
setStatus("📦 Creating Audios ZIP for Super Phone...");
try{
const allAudios=await getAllAudiosFromDB();
if(allAudios.length===0){alert("No audios yet! Record + Save first!");return;}
let JSZip:any;try{JSZip=(await import('jszip')).default;}catch{alert("Run: npm install jszip - Then reload");return;}
const zip=new JSZip();
zip.file('COPYRIGHT.txt',`${COPYRIGHT}\nAny effort made by someone should be valued.\n`);
zip.file('manifest.json',JSON.stringify({copyright:COPYRIGHT,audiosCount:allAudios.length,boxes:done,files:allAudios.map((a:any)=>({id:a.id,file:a.name}))},null,2));
const folder=zip.folder('audios');allAudios.forEach((item:any)=>{if(item.blob)folder.file(item.name,item.blob);});
const content=await zip.generateAsync({type:'blob'});const url=URL.createObjectURL(content);const a=document.createElement('a');a.href=url;a.download=`nqai_seed1000_${allAudios.length}_AUDIOS_COPYRIGHTED_SUPERPHONE_${new Date().toISOString().slice(0,10)}.zip`;a.click();
setStatus(`✅ Audios ZIP created! ${allAudios.length} audios for Super Phone!`);
}catch(e:any){alert(`ZIP error: ${e.message}\nRun: npm install jszip`);}
};
return(
<div style={{fontFamily:"system-ui",background:"#f6f7f9",minHeight:"100vh"}}><div style={{maxWidth:"1300px",margin:"0 auto",padding:"8px"}}>
<div style={{background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"10px"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><div><b>NqAI Seed1000 - © Mic + Play + Audios ZIP + Effort Valued</b><div style={{fontSize:"10px",color:"#666"}}>{COPYRIGHT} - {audiosCount} audios for Super Phone</div></div><span>{done.length}/1000 - BOX {idx}/1000 - 🎤 {audiosCount} audios</span></div>
<div style={{marginTop:"8px",display:"flex",gap:"6px",flexWrap:"wrap"}}>
<button onClick={exportJSON} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#fff"}}>📥 JSON ©</button>
<button onClick={exportCSV} style={{fontSize:"11px",border:"1px solid #22c55e",borderRadius:"999px",padding:"6px 12px",background:"#f0fdf4",fontWeight:700}}>📥 CSV ©</button>
<button onClick={exportJS} style={{fontSize:"11px",border:"1px solid #ddd",borderRadius:"999px",padding:"6px 12px",background:"#e0e7ff"}}>📥 JS ©</button>
<button onClick={exportAudiosZip} style={{fontSize:"11px",background:"#7c3aed",color:"#fff",borderRadius:"999px",padding:"8px 14px",border:"none",fontWeight:800}}>📦 Audios ZIP © - {audiosCount} for Super Phone!</button>
</div>
</div>
<div style={{marginTop:"8px",background:rec?"#fecaca":hasAudio?"#dbeafe":"#d1fae5",borderRadius:"8px",padding:"8px",fontSize:"11px",fontWeight:700,textAlign:"center"}}>{rec?"🔴 RECORDING FOR ZIP!":hasAudio?`✅ Audio ready! Will be in ZIP! Total: ${audiosCount} - ${status}`:`🤖 Auto + 🎤 ${audiosCount} audios saved for Super Phone ZIP`}</div>
<div style={{marginTop:"10px",display:"grid",gridTemplateColumns:"1.2fr 0.6fr",gap:"12px"}}>
<div>
<div style={{background:"#fff",borderRadius:"12px",padding:"14px",border:"1px solid #e5e7eb"}}>
<div style={{display:"flex",justifyContent:"space-between"}}><b>BOX {idx} / 1000 - {cur.cat}</b><span style={{fontSize:"10px",background:hasAudio?"#3b82f6":"#000",color:"#fff",padding:"3px 8px",borderRadius:"999px"}}>{hasAudio?`🎤 Audio Ready - ${audiosCount} in ZIP`:"© Effort Valued"}</span></div>
<div style={{fontSize:"26px",fontWeight:800,marginTop:"12px"}}>❝ {cur.en}</div>
<div style={{marginTop:"14px",background:"#f0fdf4",border:"2px solid #22c55e",borderRadius:"12px",padding:"12px"}}>
<input value={zomi} onChange={e=>handleZomiChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')save();}} placeholder="Type correct Zomi - For Super Phone!" autoFocus style={{width:"100%",padding:"12px",borderRadius:"10px",border:"2px solid #22c55e"}}/>
<div style={{display:"flex",gap:"6px",marginTop:"8px"}}>
<input value={hint} onChange={e=>handleHintChange(e.target.value)} placeholder='Auto voice hint' style={{flex:1,padding:"10px",borderRadius:"8px",border:hintAuto?"1px dashed #22c55e":"1px solid #f59e0b",background:hintAuto?"#f0fdf4":"#fffbeb"}}/>
<button onClick={startRec} style={{background:rec?"#ef4444":"#16a34a",color:"#fff",border:"none",borderRadius:"999px",padding:"10px 16px",fontWeight:800,cursor:"pointer"}}>{rec?"● STOP":"● RECORD"}</button>
{hasAudio&&audioURL&&<button onClick={playAudio} style={{background:"#3b82f6",color:"#fff",border:"none",borderRadius:"999px",padding:"10px 16px",fontWeight:800}}>▶️ PLAY</button>}
</div>
{hasAudio&&audioURL&&<div style={{marginTop:"8px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"8px",padding:"8px"}}><audio ref={audioPlayerRef} src={audioURL} controls style={{width:"100%",height:"32px"}}/><div style={{fontSize:"10px",color:"#666"}}>Will be in Audios ZIP for Super Phone - BOX_{cur.id}.webm</div></div>}
<button onClick={save} style={{marginTop:"12px",width:"100%",background:"#16a34a",color:"#fff",padding:"12px",borderRadius:"10px",border:"none",fontWeight:800}}>Enter = Save & Next → BOX {idx+1} - With Audio for ZIP ✅</button>
</div>
</div>
</div>
</div>
<div style={{marginTop:"16px",background:"#fff",border:"1px solid #e5e7eb",borderRadius:"12px",padding:"14px",textAlign:"center"}}>
<div style={{fontWeight:800}}>© 2026 NqAI LLC - Audios ZIP + Copyrighted - Super Phone Ready</div>
<div style={{fontSize:"11px",color:"#666",marginTop:"4px"}}>Any effort made by someone should be valued. — {audiosCount} audios + {done.length} texts — Can modify to user's voice both sides or lady voice later!</div>
</div>
</div></div>
);
}
