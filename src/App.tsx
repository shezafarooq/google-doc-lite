import { useEffect, useRef, useState } from 'react'
import { api, type DocSummary, type Document, type User } from './api'
import Editor from './Editor'
import { ArrowLeft, Check, FileText, More, Plus, Search, Share, Trash, Upload, Users } from './icons'

const timeAgo = (value: string) => {
  const seconds = Math.max(1, (Date.now() - new Date(value.replace(' ', 'T') + (value.includes('Z') ? '' : 'Z')).getTime()) / 1000)
  if (seconds < 60) return 'Just now'; if (seconds < 3600) return `${Math.floor(seconds/60)}m ago`; if (seconds < 86400) return `${Math.floor(seconds/3600)}h ago`; return new Date(value).toLocaleDateString(undefined, {month:'short', day:'numeric'})
}

export default function App() {
  const [users, setUsers] = useState<User[]>([]), [userId, setUserId] = useState(1)
  const [docs, setDocs] = useState<DocSummary[]>([]), [activeId, setActiveId] = useState<number|null>(null), [doc, setDoc] = useState<Document|null>(null)
  const [tab, setTab] = useState<'all'|'owned'|'shared'>('all'), [search, setSearch] = useState(''), [loading, setLoading] = useState(true)
  const [dirty, setDirty] = useState(false), [saving, setSaving] = useState(false), [toast, setToast] = useState<{message:string;type:'success'|'error'}|null>(null), [shareOpen, setShareOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null), saveTimer = useRef<number|undefined>(undefined), toastTimer = useRef<number|undefined>(undefined)
  const currentUser = users.find(u => u.id === userId)

  const notify = (message: string, type: 'success'|'error' = 'success') => { window.clearTimeout(toastTimer.current); setToast({message,type}); toastTimer.current = window.setTimeout(() => setToast(null), type === 'error' ? 6000 : 3000) }
  const loadDocs = async () => { setLoading(true); try { setDocs(await api.documents(userId)) } catch(e:any) { notify(e.message, 'error') } finally { setLoading(false) } }
  useEffect(() => { api.users().then(setUsers).catch(e => notify(e.message, 'error')) }, [])
  useEffect(() => { setActiveId(null); setDoc(null); loadDocs() }, [userId])
  useEffect(() => { if (!activeId) return; setLoading(true); api.document(activeId, userId).then(setDoc).catch(e => { notify(e.message, 'error'); setActiveId(null) }).finally(() => setLoading(false)) }, [activeId, userId])

  const save = async (nextDoc = doc) => {
    if (!nextDoc || !dirty) return
    setSaving(true)
    try { await api.save(nextDoc.id, userId, nextDoc.title, nextDoc.content); setDirty(false); await loadDocs() }
    catch(e:any) { notify(e.message, 'error') } finally { setSaving(false) }
  }
  useEffect(() => { if (!dirty || !doc) return; window.clearTimeout(saveTimer.current); saveTimer.current = window.setTimeout(() => save(), 900); return () => window.clearTimeout(saveTimer.current) }, [doc?.title, doc?.content, dirty])
  const updateDoc = (change: Partial<Document>) => { setDoc(old => old ? {...old, ...change} : old); setDirty(true) }
  const create = async () => { try { const result = await api.create(userId); await loadDocs(); setActiveId(result.id) } catch(e:any) { notify(e.message, 'error') } }
  const upload = async (file?: File) => { if (!file) return; try { const result = await api.upload(file, userId); await loadDocs(); setActiveId(result.id); notify('File imported as a new document') } catch(e:any) { notify(e.message, 'error') } if(fileRef.current) fileRef.current.value='' }
  const remove = async () => { if (!doc || !confirm(`Delete “${doc.title}”? This cannot be undone.`)) return; try { await api.delete(doc.id, userId); setDoc(null); setActiveId(null); loadDocs(); notify('Document deleted') } catch(e:any) { notify(e.message, 'error') } }

  if (activeId && doc) return <div className="editor-shell">
    <header className="editor-header">
      <button className="icon-button" onClick={() => { save(); setActiveId(null); setDoc(null) }} aria-label="Back to documents"><ArrowLeft/></button>
      <div className="mini-logo"><FileText/></div>
      <div className="title-area">
        <input value={doc.title} onChange={e => updateDoc({title:e.target.value})} onBlur={() => save()} aria-label="Document title" />
        <div className="save-state">{saving ? <><span className="spinner"/> Saving…</> : dirty ? 'Unsaved changes' : <><Check/> Saved</>}</div>
      </div>
      <div className="editor-actions">
        {doc.access === 'owner' && <button className="danger-icon" onClick={remove} title="Delete document"><Trash/></button>}
        <div className="avatar small" style={{background:currentUser?.color}}>{currentUser?.name[0]}</div>
        {doc.access === 'owner' ? <button className="primary-button" onClick={() => setShareOpen(true)}><Share/> Share</button> : <span className="shared-pill"><Users/> Shared by {doc.ownerName}</span>}
      </div>
    </header>
    <main className="editor-main"><Editor content={doc.content} onChange={content => updateDoc({content})}/></main>
    {shareOpen && <ShareModal doc={doc} users={users} onClose={() => setShareOpen(false)} onChanged={async () => setDoc(await api.document(doc.id, userId))} notify={notify}/>} 
    {toast && <Toast toast={toast} close={() => setToast(null)}/>} 
  </div>

  const filtered = docs.filter(d => (tab === 'all' || d.section === tab) && d.title.toLowerCase().includes(search.toLowerCase()))
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><FileText/></div><span>Ajaia <b>Docs</b></span></div>
      <button className="new-button" onClick={create}><Plus/> New document</button>
      <nav>
        <button className={tab==='all'?'selected':''} onClick={()=>setTab('all')}><FileText/><span>All documents</span><em>{docs.length}</em></button>
        <button className={tab==='owned'?'selected':''} onClick={()=>setTab('owned')}><span className="nav-dot owned"/><span>Owned by me</span><em>{docs.filter(d=>d.section==='owned').length}</em></button>
        <button className={tab==='shared'?'selected':''} onClick={()=>setTab('shared')}><Users/><span>Shared with me</span><em>{docs.filter(d=>d.section==='shared').length}</em></button>
      </nav>
      <div className="sidebar-bottom">
        <p>IMPORT</p><button className="import-button" onClick={()=>fileRef.current?.click()}><Upload/><span>Upload .txt or .md<small>Maximum file size 1 MB</small></span></button>
        <input ref={fileRef} hidden type="file" accept=".txt,.md,text/plain,text/markdown" onChange={e=>upload(e.target.files?.[0])}/>
        <div className="user-switcher"><div className="avatar" style={{background:currentUser?.color}}>{currentUser?.name[0]}</div><label><span>Viewing as</span><select value={userId} onChange={e=>setUserId(Number(e.target.value))}>{users.map(u=><option key={u.id} value={u.id}>{u.name}</option>)}</select></label></div>
      </div>
    </aside>
    <main className="dashboard">
      <header><div><span className="eyebrow">WORKSPACE</span><h1>{tab==='owned'?'Owned by me':tab==='shared'?'Shared with me':'All documents'}</h1><p>Your ideas, drafts, and shared work — all in one place.</p></div><div className="search"><Search/><input placeholder="Search documents" value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div></header>
      {loading ? <div className="empty"><span className="spinner large"/><p>Loading your documents…</p></div> : filtered.length ? <section className="doc-grid">{filtered.map(d=><article key={d.id} onClick={()=>setActiveId(d.id)} tabIndex={0} onKeyDown={e=>e.key==='Enter'&&setActiveId(d.id)}>
        <div className="doc-preview"><div className="page-lines"><b>{d.title}</b><span/><span/><span/><span className="short"/></div><button onClick={e=>e.stopPropagation()} aria-label="Document options"><More/></button></div>
        <div className="doc-meta"><div className="file-icon"><FileText/></div><div><h2>{d.title}</h2><p>{d.section==='shared'?`Shared by ${d.ownerName}`:'Private document'} · {timeAgo(d.updatedAt)}</p></div><span className={`status ${d.section}`}>{d.section==='owned'?'Owner':'Shared'}</span></div>
      </article>)}</section> : <div className="empty"><div className="empty-icon"><FileText/></div><h2>{search?'No matching documents':'A blank page is a good beginning.'}</h2><p>{search?'Try a different search term.':'Create a document or import a text file to get started.'}</p>{!search&&<button className="primary-button" onClick={create}><Plus/> Create document</button>}</div>}
    </main>{toast&&<Toast toast={toast} close={() => setToast(null)}/>} 
  </div>
}

function Toast({toast,close}:{toast:{message:string;type:'success'|'error'};close:()=>void}) { return <div className={`toast ${toast.type}`} role={toast.type==='error'?'alert':'status'}><span className="toast-symbol">{toast.type==='error'?'!':'✓'}</span><div><b>{toast.type==='error'?'Something went wrong':'Success'}</b><span>{toast.message}</span></div><button onClick={close} aria-label="Dismiss notification">×</button></div> }

function ShareModal({doc, users, onClose, onChanged, notify}:{doc:Document;users:User[];onClose:()=>void;onChanged:()=>Promise<void>;notify:(s:string,t?:'success'|'error')=>void}) {
  const available = users.filter(u=>u.id!==doc.ownerId && !doc.sharedWith.some(s=>s.id===u.id)); const [selected,setSelected]=useState(available[0]?.id||0); const [busy,setBusy]=useState(false)
  const add = async()=>{if(!selected)return;setBusy(true);try{await api.share(doc.id,doc.ownerId,selected);await onChanged();notify('Access granted')}catch(e:any){notify(e.message,'error')}finally{setBusy(false)}}
  const remove=async(id:number)=>{try{await api.unshare(doc.id,doc.ownerId,id);await onChanged();notify('Access removed')}catch(e:any){notify(e.message,'error')}}
  return <div className="modal-backdrop" onMouseDown={onClose}><div className="modal" onMouseDown={e=>e.stopPropagation()} role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow">SHARING</span><h2>Share “{doc.title}”</h2></div><button onClick={onClose}>×</button></div><p>People with access can open and edit this document.</p><div className="share-form"><select value={selected} onChange={e=>setSelected(Number(e.target.value))} disabled={!available.length}>{available.length?available.map(u=><option key={u.id} value={u.id}>{u.name} — {u.email}</option>):<option>Everyone already has access</option>}</select><button className="primary-button" onClick={add} disabled={!selected||busy}>Share</button></div><div className="people"><h3>People with access</h3><Person user={users.find(u=>u.id===doc.ownerId)!} label="Owner"/>{doc.sharedWith.map(u=><Person key={u.id} user={u} label="Can edit" remove={()=>remove(u.id)}/>)}</div></div></div>
}
function Person({user,label,remove}:{user:User;label:string;remove?:()=>void}){return <div className="person"><div className="avatar" style={{background:user.color}}>{user.name[0]}</div><div><b>{user.name}</b><span>{user.email}</span></div><em>{label}</em>{remove&&<button onClick={remove}>Remove</button>}</div>}
