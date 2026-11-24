'use client'
import { useState, useEffect } from 'react'

export default function EmployersPage() {
  const [employers, setEmployers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const emptyForm = { name:'', email:'', phone:'', address:'', contact_name:'', notes:'' }
  const [form, setForm] = useState(emptyForm)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setEmployers(await fetch('/api/employers').then(r=>r.json()))
    setLoading(false)
  }

  function openCreate() { setEditItem(null); setForm(emptyForm); setShowModal(true) }
  function openEdit(e:any) { setEditItem(e); setForm({name:e.name,email:e.email||'',phone:e.phone||'',address:e.address||'',contact_name:e.contact_name||'',notes:e.notes||''}); setShowModal(true) }

  async function handleSave(e:React.FormEvent) {
    e.preventDefault(); setSaving(true)
    if (editItem) await fetch(`/api/employers/${editItem.id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    else await fetch('/api/employers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)})
    setSaving(false); setShowModal(false); load()
  }

  const filtered = employers.filter(e=>e.name.toLowerCase().includes(search.toLowerCase())||(e.email||'').toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,color:'#1a2340'}}>Employers</h1>
        <button onClick={openCreate} style={{background:'#4472C4',color:'white',border:'none',borderRadius:7,padding:'0.6rem 1.25rem',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>+ Add Employer</button>
      </div>
      <div style={{marginBottom:'1.25rem'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employers..." style={{padding:'0.5rem 0.875rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',width:300}} />
      </div>
      <div style={{background:'white',borderRadius:10,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden'}}>
        {loading ? <div style={{padding:'3rem',textAlign:'center',color:'#9CA3AF'}}>Loading...</div> : filtered.length===0 ? <div style={{padding:'3rem',textAlign:'center',color:'#9CA3AF'}}>No employers found.</div> : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead><tr style={{background:'#F9FAFB',borderBottom:'1px solid #E5E7EB'}}>{['Company','Contact','Email','Phone',''].map(h=><th key={h} style={{padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.75rem',fontWeight:600,color:'#6B7280',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(emp=>(
                <tr key={emp.id} style={{borderBottom:'1px solid #F3F4F6'}}>
                  <td style={{padding:'0.875rem 1rem',fontWeight:700,color:'#1a2340',fontSize:'0.9rem'}}>{emp.name}</td>
                  <td style={{padding:'0.875rem 1rem',fontSize:'0.875rem'}}>{emp.contact_name||'-'}</td>
                  <td style={{padding:'0.875rem 1rem',fontSize:'0.825rem',color:'#4472C4'}}>{emp.email||'-'}</td>
                  <td style={{padding:'0.875rem 1rem',fontSize:'0.825rem',color:'#6B7280'}}>{emp.phone||'-'}</td>
                  <td style={{padding:'0.875rem 1rem'}}><button onClick={()=>openEdit(emp)} style={{background:'#EBF0FA',color:'#4472C4',border:'none',borderRadius:5,padding:'0.3rem 0.7rem',fontSize:'0.75rem',fontWeight:600,cursor:'pointer'}}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'1rem'}}>
          <div style={{background:'white',borderRadius:12,padding:'2rem',width:'100%',maxWidth:480}}>
            <h2 style={{fontSize:'1.1rem',fontWeight:700,color:'#1a2340',marginBottom:'1.5rem'}}>{editItem?'Edit Employer':'Add Employer'}</h2>
            <form onSubmit={handleSave}>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                {[{label:'Company Name *',key:'name',required:true},{label:'Contact Person',key:'contact_name',required:false},{label:'Email',key:'email',required:false},{label:'Phone',key:'phone',required:false},{label:'Address',key:'address',required:false}].map(f=>(
                  <div key={f.key}>
                    <label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>{f.label}</label>
                    <input required={f.required} value={(form as any)[f.key]} onChange={e=>setForm(prev=>({...prev,[f.key]:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',boxSizing:'border-box'}} />
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',marginTop:'1.5rem'}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{padding:'0.6rem 1.25rem',borderRadius:7,border:'1px solid #D1D5DB',background:'white',cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'0.6rem 1.5rem',borderRadius:7,border:'none',background:'#4472C4',color:'white',fontWeight:600,cursor:'pointer'}}>{saving?'Saving...':editItem?'Save Changes':'Add Employer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
