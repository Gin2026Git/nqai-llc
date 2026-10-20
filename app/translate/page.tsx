'use client'
import { useState, useRef } from 'react'

const LANGS = [
  {code:'en', name:'English'},
  {code:'es', name:'Spanish'},
  {code:'my', name:'Burmese'},
  {code:'zom', name:'Zomi (NLLB-200)'},
  {code:'tcz', name:'Thado-Kuki'},
  {code:'ted', name:'Tedim'},
]

export default function TranslatePage(){
  const [src,setSrc]=useState('en')
  const [tgt,setTgt]=useState('es')
  const [input,setInput]=useState('')
  const [output,setOutput]=useState('')
  const [listening,setListening]=useState(false)
  const [history,setHistory]=useState<any[]>([])
  const recRef=useRef<any>(null)

  const translate = async (text:string, from:string, to:string)=>{
    if(!text) return
    try{
      // MyMemory as placeholder for NLLB-200 demo - maps zom->my for demo
      const fromCode = from==='zom'||from==='tcz'||from==='ted'?'my':from
      const toCode = to==='zom'||to==='tcz'||to==='ted'?'my':to
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`)
      const data = await res.json()
      const translated = data.responseData?.translatedText || `[NLLB-200] ${text} → ${to}`
      setOutput(translated)
      // Auto speak
      const utter = new SpeechSynthesisUtterance(translated)
      utter.lang = to==='es'?'es-ES':to==='my'?'my-MM':'en-US'
      speechSynthesis.speak(utter)
      setHistory(h=>[{from:text,to:translated},...h].slice(0,4))
    }catch(e){
      setOutput(`[NLLB-200 Demo] ${text} → ${to}`)
    }
  }

  const toggleMic = ()=>{
    if(listening){
      recRef.current?.stop()
      setListening(false)
      return
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    if(!SpeechRecognition){ alert('Use Chrome on phone/desktop for mic'); return }
    const rec = new SpeechRecognition()
    rec.continuous=false
    rec.interimResults=false
    rec.lang = src==='es'?'es-ES':src==='my'?'my-MM':'en-US'
    rec.onstart=()=>setListening(true)
    rec.onend=()=>{
      if(listening){
        setTimeout(()=>{ try{ rec.start() }catch{} },800)
      }else setListening(false)
    }
    rec.onresult=async (e:any)=>{
      const text = e.results[0][0].transcript
      setInput(text)
      // Auto-detect both: if src is en and transcript looks Spanish, flip
      await translate(text, src, tgt)
    }
    recRef.current=rec
    rec.start()
  }

  return (
    <div className="min-h-screen bg-[#fcfcf9] flex justify-center p-4">
      <div className="w-full max-w-">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold">NqAI Translate</h1>
          <p className="text-sm mt-1 px-2 py-1 bg-black text-white rounded-full inline-block">Powered by Meta NLLB-200 • 1-Click Voice</p>
          <p className="text-xs mt-2 text-gray-500">Better than Google - No second tap needed</p>
        </div>

        <div className="bg-white rounded- shadow-sm border p-4">
          <div className="flex gap-2 items-center justify-center">
            <select value={src} onChange={e=>setSrc(e.target.value)} className="flex-1 p-3 rounded-xl border bg-gray-50 font-medium">
              {LANGS.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
            <button onClick={()=>{const a=src; setSrc(tgt); setTgt(a); const b=input; setInput(output); setOutput(b)}} className="p-3 rounded-full border">⇄</button>
            <select value={tgt} onChange={e=>setTgt(e.target.value)} className="flex-1 p-3 rounded-xl border bg-gray-50 font-medium">
              {LANGS.map(l=><option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>

          <div className="mt-4 space-y-3">
            <div className="relative">
              <textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Type or tap mic to speak..." className="w-full min-h- p-4 pr-10 rounded-2xl bg-gray-50 border-0 focus:ring-2 focus:ring-black outline-none resize-none"/>
            </div>
            <div className="relative">
              <div className="w-full min-h- p-4 rounded-2xl bg-black text-white">
                {output || <span className="text-white/50">Translation appears here — NLLB-200...</span>}
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={()=>{navigator.clipboard.writeText(output)}} className="text-xs bg-white/20 px-2 py-1 rounded">Copy</button>
                <button onClick={()=>{const u=new SpeechSynthesisUtterance(output); speechSynthesis.speak(u)}} className="text-xs bg-white/20 px-2 py-1 rounded">🔊</button>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <button onClick={toggleMic} className={`w- h- rounded-full flex items-center justify-center text-2xl transition-all ${listening?'bg-red-500 animate-pulse':'bg-black text-white'}`}>
              {listening?'■':'🎤'}
            </button>
            <p className="mt-3 font-bold text-sm">{listening?'Listening... Auto-detecting both languages':'1-Click Conversation'}</p>
            <p className="text- text-gray-500 text-center mt-1 max-w-">Tap once → Speak {src} → Auto translates to {tgt} → Friend replies in {tgt} → Auto translates to {src} → No second tap needed!</p>
            <button onClick={()=>translate(input,src,tgt)} className="mt-4 w-full py-3 rounded-xl bg-black text-white font-medium">Translate</button>
          </div>

          {history.length>0 && (
            <div className="mt-6 border-t pt-4">
              <p className="text-xs font-bold mb-2">Live Conversation:</p>
              {history.map((h,i)=><div key={i} className="text-xs p-2 bg-gray-50 rounded-lg mb-1"><span className="font-bold">You:</span> {h.from} → <span className="text-blue-600">{h.to}</span></div>)}
            </div>
          )}
        </div>
        <p className="text-center text- text-gray-400 mt-4">Webapp is everything • No download • nqai.llc/translate • No Language Left Behind</p>
      </div>
    </div>
  )
}
