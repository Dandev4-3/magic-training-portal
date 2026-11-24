'use client'
import { useEffect, useState } from 'react'

export default function RegistrationsPage() {
  const [regs, setRegs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [learners, setLearners] = useState<any[]>([])
  const [courses, setCourses] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  const [form, setForm] = useState({ learner_id:'', course_id:'', staff_id:'', start_date:'', end_date:'', status:'ACTIVE', notes:'' })
  const [saving, setSaving] = useState(false)

  async function load() {
    const params = new URLSearchParams()
    if (statusFilter !== 'All') params.set('status', statusFilter)
    if (search) params.set('search', search)
    const r = await fetch(`/api/registrations?${params}`)
    const d = await r.json()
    setRegs(d.registrations || d)
    setLoading(false)
  }

  useEffect(() => { load() }, [statusFilter, search])
  useEffect(() => {
    Promise.all([fetch('/api/learners?limit=500').then(r=>r.json()),fetch('/api/courses').then(r=>r.json()),fetch('/api/staff').then(r=>r.json())])
    .then(([lr,cr,sr]) => { setLearners(lr.learners||lr); setCourses(cr); setStaff(sr) })
  }, [])

  async function handleSave(e:React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch('/api/registrations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    setSaving(false); setShowModal(false); setForm({learner_id:'',course_id:'',staff_id:'',start_date:'',end_date:'',status:'ACTIVE',notes:''}); load()
  }

  const statuses = ['All','ACTIVE','COMPLETED','CANCELLED']
  const badge = (s:string) => { const m:any={ACTIVE:{bg:'#D1FAE5',c:'#065F46'},COMPLETED:{bg:'#DBEAFE',c:'#1D4ED8'},CANCELLED:{bg:'#FEE2E2',c:'#991B1B'},ALLOCATED:{bg:'#EDE9FE',c:'#5B21B6'},UNALLOCATED:{bg:'#F3F4F6',c:'#6B7280'}}; const v=m[s]||{bg:'#F3F4F6',c:'#6B7280'}; return <span style={{background:v.bg,color:v.c,padding:'0.2rem 0.5rem',borderRadius:4,fontSize:'0.72rem',fontWeight:600}}>{s}</span> }

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,color:'#1a2340'}}>Registrations</h1>
        <button onClick={()=>setShowModal(true)} style={{background:'#4472C4',color:'white',border:'none',borderRadius:7,padding:'0.6rem 1.25rem',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>+ New Registration</button>
      </div>
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1.25rem',flexWrap:'wrap'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search learner or course..." style={{padding:'0.5rem 0.875rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',width:280}} />
        <div style={{display:'flex',gap:'0.5rem'}}>
          {statuses.map(s=><button key={s} onClick={()=>setStatusFilter(s)} style={{padding:'0.4rem 0.875rem',borderRadius:6,border:'1px solid',borderColor:statusFilter===s?'#4472C4':'#D1D5DB',background:statusFilter===s?'#4472C4':'white',color:statusFilter===s?'white':'#374151',fontWeight:600,cursor:'pointer',fontSize:'0.78rem'}}>{s}</button>)}
        </div>
      </div>
      <div style={{background:'white',borderRadius:10,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden'}}>
        {loading ? <div style={{padding:'3rem',textAlign:'center',color:'#9CA3AF'}}>Loading...</div> : regs.length===0 ? <div style={{padding:'3rem',textAlign:'center',color:'#9CA3AF'}}>No registrations found.</div> : (
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>
            <thead><tr style={{background:'#F9FAFB',borderBottom:'1px solid #E5E7EB'}}>{['Learner','Course','Trainer','Start','Status','Allocation'].map(h=><th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.75rem',fontWeight:600,color:'#6B7280',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>
              {regs.map(r=>(
                <tr key={r.id} style={{borderBottom:'1px solid #F3F4F6'}}>
                  <td style={{padding:'0.875rem 1rem',fontWeight:600,color:'#1a2340'}}>{r.learner_name}</td>
                  <td style={{padding:'0.875rem 1rem',color:'#374151'}}>{r.course_name}</td>
                  <td style={{padding:'0.875rem 1rem',color:'#6B7280'}}>{r.staff_name||'-'}</td>
                  <td style={{padding:'0.875rem 1rem',color:'#6B7280'}}>{r.start_date?new Date(r.start_date).toLocaleDateString('en-GB'):'-'}</td>
                  <td style={{padding:'0.875rem 1rem'}}>{badge(r.status)}</td>
                  <td style={{padding:'0.875rem 1rem'}}>{badge(r.allocation_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'1rem'}}>
          <div style={{background:'white',borderRadius:12,padding:'2rem',width:'100%',maxWidth:520}}>
            <h2 style={{fontSize:'1.1rem',fontWeight:700,color:'#1a2340',marginBottom:'1.5rem'}}>New Registration</h2>
            <form onSubmit={handleSave}>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Learner *</label>
                  <select required value={form.learner_id} onChange={e=>setForm(f=>({...f,learner_id:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem'}}>
                    <option value="">Select learner</option>
                    {learners.map((l:any)=><option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                  </select></div>
                <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Course *</label>
                  <select required value={form.course_id} onChange={e=>setForm(f=>({...f,course_id:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem'}}>
                    <option value="">Select course</option>
                    {courses.map((c:any)=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select></div>
                <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Assign Trainer</label>
                  <select value={form.staff_id} onChange={e=>setForm(f=>({...f,staff_id:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem'}}>
                    <option value="">Unallocated</option>
                    {staff.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                  <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Start Date</label><input type="date" value={form.start_date} onChange={e=>setForm(f=>({...f,start_date:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',boxSizing:'border-box'}} /></div>
                  <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>End Date</label><input type="date" value={form.end_date} onChange={e=>setForm(f=>({...f,end_date:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',boxSizing:'border-box'}} /></div>
                </div>
              </div>
              <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',marginTop:'1.5rem'}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{padding:'0.6rem 1.25rem',borderRadius:7,border:'1px solid #D1D5DB',background:'white',cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'0.6rem 1.5rem',borderRadius:7,border:'none',background:'#4472C4',color:'white',fontWeight:600,cursor:'pointer'}}>{saving?'Saving...':'Add Registration'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
