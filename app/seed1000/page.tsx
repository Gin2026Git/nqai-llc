'use client';
import { useState, useEffect, useRef } from 'react';

const DATA_KEY = 'nqai_seed_progress_data';
const LAST_KEY = 'nqai_seed_last_index';
const LANG_LIST_KEY = 'nqai_7000_lang_list';
const LANG_CURRENT_KEY = 'nqai_7000_current_lang';
const COPYRIGHT_SOLE = '© 2026 NqAI LLC - SOLE OWNER - All Rights Reserved - NqAI Seed1000 7000 Languages - Smyrna, TN, USA - SOLELY OWNED by NqAI LLC - Any effort valued. 🙏';
const DB_PREFIX = 'NqAI_Seed1000_Audios_';
const STORE_NAME = 'audios';

const BASE = [
  "Hello","How are you?","I am fine","What is your name?","My name is...",
  "Good morning","Good afternoon","Good evening","Good night","Thank you",
  "Please","Sorry","Yes","No","Where is market?","How much?","Too expensive",
  "Water please","Food please","My family","My father","My mother","House",
  "Village","School","Today","Tomorrow","Church","Help me","Hospital","Doctor","Phone number"
];

const CATS = ["Greetings","Market & Food","Nature & Weather","Church & Community","Family & Home","Home & Village","School & Work","Time & Numbers"];

function getList() {
  const l: any[] = [];
  for (let i = 0; i < 1000; i++) {
    const en = i < BASE.length ? BASE[i] : `Common phrase #${i + 1}`;
    l.push({ id: i + 1, en, cat: CATS[i % CATS.length] });
  }
  return l;
}

function openDB(langCode: string): Promise<IDBDatabase> {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB_PREFIX + langCode, 1);
    r.onupgradeneeded = () => {
      const db = r.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function saveAudioToDB(langCode: string, id: number, blob: Blob, name: string, en: string, correct: string, meta: any) {
  try {
    const db = await openDB(langCode);
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({
      id, blob, name, en, correctZomi: correct,
      timestamp: new Date().toISOString(),
      ...meta, copyright: COPYRIGHT_SOLE
    });
    return true;
  } catch { return false; }
}

async function getAllAudiosFromDB(langCode: string) {
  const db = await openDB(langCode);
  const tx = db.transaction(STORE_NAME, 'readonly');
  return new Promise<any[]>((res, rej) => {
    const r = tx.objectStore(STORE_NAME).getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}

async function getAudioById(langCode: string, id: number) {
  try {
    const db = await openDB(langCode);
    const tx = db.transaction(STORE_NAME, 'readonly');
    return new Promise<any>((res, rej) => {
      const r = tx.objectStore(STORE_NAME).get(id);
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
  } catch { return null; }
}

async function getAudiosCount(langCode: string) {
  try { return (await getAllAudiosFromDB(langCode)).length; } catch { return 0; }
}

const DEFAULT_LANGS = [
  { code: 'zom', name: 'Zomi', dialect: 'Tedim', native: 'Zomi', creator: 'NqAI Community', region: 'Smyrna, TN', copyright: COPYRIGHT_SOLE }
];

export default function Page() {
  const all = getList();
  const [langList, setLangList] = useState<any[]>(DEFAULT_LANGS);
  const [currentLang, setCurrentLang] = useState<any>(DEFAULT_LANGS[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLang, setNewLang] = useState({ name: '', dialect: '', native: '', creator: '', region: '', code: '' });
  const [contributorName, setContributorName] = useState('');
  const [idx, setIdx] = useState(1);
  const [zomi, setZomi] = useState('');
  const [hint, setHint] = useState('');
  const [hintAuto, setHintAuto] = useState(true);
  const [done, setDone] = useState<any[]>([]);
  const [status, setStatus] = useState('7000 Languages - Multi-Contributor + Done Locked - SOLE OWNER NqAI');
  const [rec, setRec] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [hasAudio, setHasAudio] = useState(false);
  const [audiosCount, setAudiosCount] = useState(0);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);

  const recRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const getKeys = (code: string) => ({ data: `${DATA_KEY}_${code}`, last: `${LAST_KEY}_${code}` });
  const isBoxDone = (id: number) => done.find((d: any) => d.id === id);
  const findNextUndone = (from: number) => {
    for (let i = from; i <= 1000; i++) { if (!isBoxDone(i)) return i; }
    return -1;
  };
  const findPrevUndone = (from: number) => {
    for (let i = from; i >= 1; i--) { if (!isBoxDone(i)) return i; }
    return -1;
  };

  useEffect(() => {
    const savedList = localStorage.getItem(LANG_LIST_KEY);
    const savedCurrent = localStorage.getItem(LANG_CURRENT_KEY);
    const savedContributor = localStorage.getItem('nqai_contributor_name');
    if (savedList) { try { setLangList(JSON.parse(savedList)); } catch {} }
    if (savedCurrent) { try { setCurrentLang(JSON.parse(savedCurrent)); } catch {} }
    if (savedContributor) setContributorName(savedContributor);
  }, []);

  useEffect(() => {
    if (!currentLang) return;
    const keys = getKeys(currentLang.code);
    const last = localStorage.getItem(keys.last);
    const data = localStorage.getItem(keys.data);
    if (data) { try { setDone(JSON.parse(data)); } catch { setDone([]); } } else setDone([]);
    if (last) {
      const n = parseInt(last);
      if (n >= 1 && n <= 1000) setIdx(n); else setIdx(1);
    } else {
      setIdx(findNextUndone(1) || 1);
    }
    getAudiosCount(currentLang.code).then(c => setAudiosCount(c));
  }, [currentLang]);

  useEffect(() => {
    if (!currentLang) return;
    const keys = getKeys(currentLang.code);
    localStorage.setItem(keys.last, String(idx));
  }, [idx, currentLang]);

  useEffect(() => { localStorage.setItem(LANG_LIST_KEY, JSON.stringify(langList)); }, [langList]);
  useEffect(() => { localStorage.setItem(LANG_CURRENT_KEY, JSON.stringify(currentLang)); }, [currentLang]);
  useEffect(() => { localStorage.setItem('nqai_contributor_name', contributorName); }, [contributorName]);

  useEffect(() => {
    const entry = done.find((c: any) => c.id === idx);
    if (entry) {
      setZomi(entry.correctZomi || '');
      setHint(entry.voiceHint || '');
      setHintAuto(false);
      setHasAudio(!!entry.hasAudio);
      if (entry.hasAudio) {
        getAudioById(currentLang.code, idx).then(ad => {
          if (ad && ad.blob) {
            const u = URL.createObjectURL(ad.blob);
            setAudioURL(u);
            setCurrentBlob(ad.blob);
          }
        });
      }
      setStatus(`🔒 BOX ${idx} ALREADY DONE by ${entry.contributor || 'Someone'} - Locked!`);
    } else {
      setZomi('');
      setHint('');
      setHintAuto(true);
      setAudioURL(null);
      setCurrentBlob(null);
      setHasAudio(false);
      setStatus(`New ${currentLang.name} BOX ${idx} - Available!`);
    }
  }, [idx, done, currentLang]);

  const cur = all[idx - 1];
  const locked = !!isBoxDone(idx);

  const goBack = () => {
    const prev = findPrevUndone(idx - 1);
    if (prev !== -1) setIdx(prev);
  };

  const goForward = () => {
    const next = findNextUndone(idx + 1);
    if (next !== -1) setIdx(next);
  };

  const handleAddLanguage = () => {
    if (!newLang.name.trim()) { alert('Enter Language Name'); return; }
    const code = (newLang.code.trim().toLowerCase() || newLang.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)) + '_' + Date.now().toString().slice(-4);
    const entry = {
      code, name: newLang.name.trim(),
      dialect: newLang.dialect.trim() || 'Standard',
      native: newLang.native.trim() || newLang.name.trim(),
      creator: newLang.creator.trim() || 'Community',
      region: newLang.region.trim() || '',
      created: new Date().toISOString(),
      copyright: COPYRIGHT_SOLE
    };
    setLangList([...langList, entry]);
    setCurrentLang(entry);
    setNewLang({ name: '', dialect: '', native: '', creator: '', region: '', code: '' });
    setShowAdd(false);
  };

  const startRec = async () => {
    if (locked) return;
    if (rec) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') mediaRecorderRef.current.stop();
      if (recRef.current) { try { recRef.current.stop(); } catch {} }
      setRec(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setCurrentBlob(blob);
        setHasAudio(true);
        setStatus(`✅ Audio for ${currentLang.name} BOX ${cur.id} - ${contributorName}`);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      };
      mr.start();
      setHasAudio(false);
      setAudioURL(null);
      setCurrentBlob(null);
      setRec(true);
      setStatus('🔴 RECORDING...');
    } catch { alert('Allow Mic'); }
  };

  const playAudio = () => { if (audioPlayerRef.current && audioURL) audioPlayerRef.current.play(); };
  const handleZomiChange = (val: string) => { if (locked) return; setZomi(val); if (hintAuto || hint === '') setHint(val.toLowerCase()); };
  const handleHintChange = (val: string) => {
    if (locked) return;
    setHint(val);
    if (val.toLowerCase() !== zomi.toLowerCase() && val !== '') setHintAuto(false);
    if (val === '') setHintAuto(true);
  };

  const save = async () => {
    if (locked) { alert(`🔒 BOX ${idx} already done!`); return; }
    if (!zomi.trim()) return;
    if (!contributorName.trim()) { alert('Enter Your Name first!'); return; }
    const fileName = `BOX_${cur.id}_${currentLang.code}_${contributorName.replace(/[^a-zA-Z0-9]/g, '_')}.webm`;
    if (currentBlob && hasAudio) {
      await saveAudioToDB(currentLang.code, cur.id, currentBlob, fileName, cur.en, zomi.trim(), { language: currentLang.name, dialect: currentLang.dialect, contributor: contributorName });
      setAudiosCount(await getAudiosCount(currentLang.code));
    }
    const entry = {
      id: cur.id, en: cur.en, cat: cur.cat,
      correctZomi: zomi.trim(),
      voiceHint: hint.trim() || zomi.trim().toLowerCase(),
      hasAudio, audioFile: hasAudio ? fileName : '',
      language: currentLang.name, dialect: currentLang.dialect,
      contributor: contributorName, creator: currentLang.creator,
      timestamp: new Date().toISOString(), copyright: COPYRIGHT_SOLE
    };
    const keys = getKeys(currentLang.code);
    const nd = [...done.filter((c: any) => c.id !== cur.id), entry].sort((a: any, b: any) => a.id - b.id);
    setDone(nd);
    localStorage.setItem(keys.data, JSON.stringify(nd));
    const next = findNextUndone(idx + 1);
    if (next !== -1) setIdx(next); else setIdx(idx + 1);
    setZomi(''); setHint(''); setHintAuto(true); setAudioURL(null); setHasAudio(false); setCurrentBlob(null);
  };

  const exportCSV = () => {
    const h = "id,english,correct,voice,has_audio,language,dialect,contributor,timestamp,copyright_sole_owner\n";
    const r = done.map((c: any) => `${c.id},"${c.en}","${c.correctZomi}","${c.voiceHint}","${c.hasAudio ? 'Yes' : ''}","${currentLang.name}","${currentLang.dialect}","${c.contributor || ''}","${c.timestamp || ''}","${COPYRIGHT_SOLE}"`).join("\n");
    const blob = new Blob([h + r], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nqai_seed1000_${currentLang.code}_${done.length}_SOLE_OWNER_NQAI.csv`;
    a.click();
  };

  const exportAudiosZip = async () => {
    const allAudios = await getAllAudiosFromDB(currentLang.code);
    if (allAudios.length === 0) { alert(`No audios yet for ${currentLang.name}!`); return; }
    let JSZip: any;
    try { JSZip = (await import('jszip')).default; } catch { alert('Reload'); return; }
    const zip = new JSZip();
    zip.file('COPYRIGHT_SOLE_OWNER_NQAI.txt', `${COPYRIGHT_SOLE}\nLanguage: ${currentLang.name} - ${currentLang.dialect}\nDone: ${done.length}/1000\n`);
    zip.file('DONE_LIST.json', JSON.stringify(done, null, 2));
    const folder = zip.folder('audios');
    allAudios.forEach((it: any) => { if (it.blob) folder.file(it.name, it.blob); });
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nqai_seed1000_${currentLang.code}_${allAudios.length}_AUDIOS_SOLE_OWNER_NQAI_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
  };

  const resetToZero = async () => {
    if (!confirm(`RESET ${currentLang.name} - Delete all ${done.length} done?`)) return;
    if (!confirm('Confirm ZERO?')) return;
    const keys = getKeys(currentLang.code);
    localStorage.removeItem(keys.data);
    localStorage.removeItem(keys.last);
    try {
      const db = await openDB(currentLang.code);
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).clear();
    } catch {}
    setDone([]); setIdx(1); setZomi(''); setHint(''); setAudioURL(null); setHasAudio(false); setAudiosCount(0);
  };

  const isEdited = done.find((c: any) => c.id === idx);

  return (
    <div style={{ fontFamily: 'system-ui', background: '#f6f7f9', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1350px', margin: '0 auto', padding: '8px' }}>
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                <b>🌍 NqAI 7000 - Multi-Contributor + Done Locked - SOLE OWNER</b>
                <select value={currentLang.code} onChange={e => { const f = langList.find((l: any) => l.code === e.target.value); if (f) setCurrentLang(f); }} style={{ padding: '6px 10px', borderRadius: '999px', border: '2px solid #000', fontWeight: 700, background: '#f3f4f6' }}>
                  {langList.map((l: any) => <option key={l.code} value={l.code}>{l.name} - {l.dialect}</option>)}
                </select>
                <button onClick={() => setShowAdd(true)} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 14px', fontWeight: 800, cursor: 'pointer' }}>+ Add Language</button>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700 }}>Your Name for 2-3 boxes:</span>
                <input value={contributorName} onChange={e => setContributorName(e.target.value)} placeholder="Enter Your Name - Required!" style={{ padding: '6px 10px', borderRadius: '999px', border: '2px solid #22c55e', fontWeight: 700, minWidth: '200px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button onClick={goBack} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 14px', fontWeight: 800, cursor: 'pointer' }}>◀️ BACK</button>
              <span style={{ fontWeight: 800, background: locked ? '#fee2e2' : '#f3f4f6', padding: '6px 12px', borderRadius: '999px', border: locked ? '2px solid #ef4444' : '1px solid #ddd' }}>{locked ? `🔒 BOX ${idx} DONE` : `BOX ${idx} / 1000`}</span>
              <button onClick={goForward} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: '999px', padding: '8px 14px', fontWeight: 800, cursor: 'pointer' }}>FORWARD ▶️</button>
            </div>
            <div style={{ fontWeight: 800 }}>{done.length}/1000 - 🎤 {audiosCount} - {currentLang.name}</div>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={exportCSV} style={{ fontSize: '11px', border: '1px solid #22c55e', borderRadius: '999px', padding: '6px 12px', background: '#f0fdf4', fontWeight: 700, cursor: 'pointer' }}>📥 CSV {currentLang.name}</button>
            <button onClick={exportAudiosZip} style={{ fontSize: '11px', background: '#7c3aed', color: '#fff', borderRadius: '999px', padding: '8px 14px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>📦 ZIP © SOLE OWNER - {audiosCount}</button>
            <button onClick={resetToZero} style={{ fontSize: '11px', background: '#ef4444', color: '#fff', borderRadius: '999px', padding: '6px 12px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>🗑️ RESET ZERO</button>
          </div>
        </div>

        <div style={{ marginTop: '8px', background: locked ? '#fee2e2' : hasAudio ? '#dbeafe' : '#d1fae5', border: '2px solid', borderColor: locked ? '#ef4444' : hasAudio ? '#3b82f6' : '#22c55e', borderRadius: '8px', padding: '8px', fontSize: '12px', fontWeight: 700, textAlign: 'center' }}>
          {locked ? `🔒 BOX ${idx} ALREADY DONE by ${isEdited?.contributor || 'Someone'} - Cannot enter! Click FORWARD ▶️!` : `BOX ${idx} - ${status}`}
        </div>

        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1.2fr 0.6fr', gap: '12px' }}>
          <div>
            <div style={{ background: locked ? '#fff1f2' : '#fff', borderRadius: '12px', padding: '14px', border: locked ? '2px solid #ef4444' : '1px solid #e5e7eb', borderLeft: locked ? '6px solid #ef4444' : '6px solid #22c55e' }}>
              <div style={{ fontSize: '26px', fontWeight: 800 }}>❝ {cur.en}</div>
              {isEdited && <div style={{ marginTop: '8px', fontSize: '12px', background: '#fee2e2', border: '1px dashed #ef4444', padding: '8px 10px', borderRadius: '8px' }}>🔒 BOX {idx} Done by {isEdited.contributor} on {isEdited.timestamp?.slice(0, 10)} - {isEdited.correctZomi}</div>}
              <div style={{ marginTop: '14px', background: locked ? '#fee2e2' : '#f0fdf4', border: locked ? '2px solid #ef4444' : '2px solid #22c55e', borderRadius: '12px', padding: '12px', opacity: locked ? 0.6 : 1 }}>
                <input value={zomi} onChange={e => handleZomiChange(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') save(); }} placeholder={locked ? `🔒 BOX ${idx} Done - Locked!` : `Type correct ${currentLang.name}!`} disabled={locked} autoFocus={!locked} style={{ width: '100%', padding: '12px', marginTop: '8px', borderRadius: '10px', border: locked ? '2px solid #ef4444' : '2px solid #22c55e', fontSize: '15px', background: locked ? '#fee2e2' : '#fff' }} />
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                  <input value={hint} onChange={e => handleHintChange(e.target.value)} placeholder="Voice hint" disabled={locked} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #ddd' }} />
                  <button onClick={startRec} disabled={locked} style={{ background: locked ? '#9ca3af' : rec ? '#ef4444' : '#16a34a', color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>{locked ? '🔒 LOCKED' : rec ? '● STOP' : '● RECORD'}</button>
                  {hasAudio && audioURL && <button onClick={playAudio} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '999px', padding: '10px 16px', fontWeight: 800, cursor: 'pointer' }}>▶️ PLAY</button>}
                </div>
                {hasAudio && audioURL && <div style={{ marginTop: '8px' }}><audio ref={audioPlayerRef} src={audioURL} controls style={{ width: '100%', height: '32px' }} /></div>}
                <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                  <button onClick={goBack} style={{ flex: 1, background: '#fff', border: '1px solid #ddd', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>◀️ BACK</button>
                  <button onClick={save} disabled={locked} style={{ flex: 2, background: locked ? '#9ca3af' : '#16a34a', color: '#fff', padding: '12px', borderRadius: '10px', border: 'none', fontWeight: 800, cursor: 'pointer' }}>{locked ? `🔒 Done by ${isEdited?.contributor}` : `Save & Next Undone →`}</button>
                  <button onClick={goForward} style={{ flex: 1, background: '#fff', border: '1px solid #ddd', padding: '12px', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>FORWARD ▶️</button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 700, fontSize: '13px' }}>📊 {currentLang.name} - {done.length}/1000 Done - 🔒 Locked Section</div>
              <div style={{ marginTop: '10px', background: '#111', color: '#fff', borderRadius: '8px', padding: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                <div style={{ fontWeight: 800, fontSize: '12px' }}>🔒 DONE SECTION - {currentLang.name} - {done.length}/1000 - Cannot enter again!</div>
                {done.length === 0 ? <div style={{ fontSize: '11px', color: '#aaa', marginTop: '6px' }}>No done yet - 0/1000 - All available!</div> :
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                    {done.map((d: any) => <div key={d.id} style={{ fontSize: '10px', background: d.contributor === contributorName ? '#22c55e' : '#333', color: '#fff', padding: '4px 6px', borderRadius: '4px' }}>BOX {d.id} - {d.contributor} {d.hasAudio ? '🎤' : ''}</div>)}
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px', background: '#111', color: '#fff', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
          <div style={{ fontWeight: 800 }}>© 2026 NqAI LLC - SOLE OWNER - All Rights Reserved - 7000 Languages - Smyrna, TN, USA</div>
        </div>
      </div>
    </div>
  );
}
