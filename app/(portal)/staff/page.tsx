'use client'
import { useState, useEffect } from 'react'

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', email:'', phone:'', role:'' })
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setStaff(await fetch('/api/staff').then(r=>r.json()))
    setLoading(false)
  }

  async function handleCreate(e:React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch('/api/staff',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    setSaving(false); setShowModal(false); setForm({name:'',email:'',phone:'',role:''}); load()
  }

  const filtered = staff.filter(s=>s.name.toLowerCase().includes(search.toLowerCase())||(s.email||'').toLowerCase().includes(search.toLowerCase()))
  const roles = ['Trainer','Administrator','Manager','Assessor','Coordinator','Director']

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,color:'#1a2340'}}>Staff</h1>
        <button onClick={()=>setShowModal(true)} style={{background:'#4472C4',color:'white',border:'none',borderRadius:7,padding:'0.6rem 1.25rem',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>+ Add Staff</button>
      </div>
      <div style={{marginBottom:'1.25rem'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search staff..." style={{padding:'0.5rem 0.875rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',width:280}} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'1rem'}}>
        {loading ? <div style={{color:'#9CA3AF'}}>Loading...</div> : filtered.length===0 ? <div style={{color:'#9CA3AF'}}>No staff found.</div> : filtered.map(s=>(
          <div key={s.id} style={{background:'white',borderRadius:10,padding:'1.25rem',boxShadow:'0 1px 4px rgba(0,0,0,0.06)',display:'flex',gap:'1rem',alignItems:'flex-start'}}>
            <div style={{width:44,height:44,background:'#EBF0FA',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,color:'#4472C4',fontWeight:700,fontSize:'1rem'}}>{s.name.split(' ').map((w:string)=>w[0]).slice(0,2).join('')}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:'#1a2340',fontSize:'0.95rem'}}>{s.name}</div>
              {s.role && <div style={{fontSize:'0.78rem',color:'#4472C4',fontWeight:600,marginTop:2}}>{s.role}</div>}
              {s.email && <div style={{fontSize:'0.8rem',color:'#6B7280',marginTop:4}}>{s.email}</div>}
              {s.phone && <div style={{fontSize:'0.8rem',color:'#6B7280'}}>{s.phone}</div>}
            </div>
            <span style={{padding:'0.2rem 0.5rem',borderRadius:4,fontSize:'0.7rem',fontWeight:600,background:s.is_active?'#D1FAE5':'#F3F4F6',color:s.is_active?'#065F46':'#9CA3AF',flexShrink:0}}>{s.is_active?'Active':'Inactive'}</span>
          </div>
        ))}
      </div>
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'1rem'}}>
          <div style={{background:'white',borderRadius:12,padding:'2rem',width:'100%',maxWidth:440}}>
            <h2 style={{fontSize:'1.1rem',fontWeight:700,color:'#1a2340',marginBottom:'1.5rem'}}>Add Staff Member</h2>
            <form onSubmit={handleCreate}>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                {[{label:'Full Name *',key:'name',required:true},{label:'Email',key:'email',required:false},{label:'Phone',key:'phone',required:false}].map(f=>(
                  <div key={f.key}>
                    <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>{f.label}</label>
                    <input required={f.required} value={(form as any)[f.key]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',boxSizing:'border-box'}} />
                  </div>
                ))}
                <div>
                  <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Role</label>
                  <select value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem'}}>
                    <option value="">Select role</option>
                    {roles.map(r=><option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',marginTop:'1.5rem'}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{padding:'0.6rem 1.25rem',borderRadius:7,border:'1px solid #D1D5DB',background:'white',cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'0.6rem 1.5rem',borderRadius:7,border:'none',background:'#4472C4',color:'white',fontWeight:600,cursor:'pointer'}}>{saving?'Saving...':'Add Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
