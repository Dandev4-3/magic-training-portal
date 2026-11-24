'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function LearnerDetailPage() {
  const { id } = useParams()
  const [learner, setLearner] = useState<any>(null)
  const [registrations, setRegistrations] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      fetch(`/api/learners/${id}`).then(r => r.json()),
      fetch(`/api/registrations?learnerId=${id}`).then(r => r.json()),
      fetch(`/api/invoices?learnerId=${id}`).then(r => r.json()),
    ]).then(([l, regs, invs]) => {
      setLearner(l); setForm(l); setRegistrations(regs); setInvoices(invs); setLoading(false)
    })
  }, [id])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch(`/api/learners/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setLearner(form); setEditing(false)
  }

  if (loading) return <div style={{padding:'2rem',color:'#9CA3AF'}}>Loading...</div>
  if (!learner) return <div style={{padding:'2rem',color:'#DC2626'}}>Learner not found.</div>

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.5rem'}}>
        <Link href="/learners" style={{color:'#4472C4',textDecoration:'none',fontSize:'0.875rem'}}>Back to Learners</Link>
        <span style={{color:'#D1D5DB'}}>|</span>
        <h1 style={{fontSize:'1.4rem',fontWeight:700,color:'#1a2340',margin:0}}>{learner.first_name} {learner.last_name}</h1>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:'1.5rem',alignItems:'start'}}>
        <div style={{background:'white',borderRadius:10,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden'}}>
          <div style={{background:'linear-gradient(135deg,#2F5496,#4472C4)',padding:'1.5rem',textAlign:'center'}}>
            <div style={{width:64,height:64,background:'rgba(255,255,255,0.2)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 0.75rem',fontSize:'1.5rem',fontWeight:700,color:'white'}}>{learner.first_name?.[0]}{learner.last_name?.[0]}</div>
            <div style={{color:'white',fontWeight:700,fontSize:'1rem'}}>{learner.first_name} {learner.last_name}</div>
          </div>
          {!editing ? (
            <div style={{padding:'1.25rem'}}>
              {[{label:'Email',value:learner.email},{label:'Phone',value:learner.phone},{label:'Address',value:learner.address},{label:'Notes',value:learner.notes}].filter(r=>r.value).map(r=>(
                <div key={r.label} style={{marginBottom:'0.75rem'}}>
                  <div style={{fontSize:'0.7rem',color:'#9CA3AF',fontWeight:600,textTransform:'uppercase'}}>{r.label}</div>
                  <div style={{fontSize:'0.875rem',color:'#374151',marginTop:2}}>{r.value}</div>
                </div>
              ))}
              <button onClick={()=>setEditing(true)} style={{width:'100%',marginTop:'0.5rem',background:'#EBF0FA',color:'#4472C4',border:'none',borderRadius:7,padding:'0.6rem',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleSave} style={{padding:'1.25rem'}}>
              {[{label:'First Name',key:'first_name'},{label:'Last Name',key:'last_name'},{label:'Email',key:'email'},{label:'Phone',key:'phone'},{label:'Address',key:'address'}].map(f=>(
                <div key={f.key} style={{marginBottom:'0.75rem'}}>
                  <label style={{display:'block',fontSize:'0.75rem',fontWeight:600,color:'#6B7280',marginBottom:3}}>{f.label}</label>
                  <input value={form[f.key]||''} onChange={e=>setForm((p:any)=>({...p,[f.key]:e.target.value}))} style={{width:'100%',padding:'0.4rem 0.625rem',borderRadius:6,border:'1px solid #D1D5DB',fontSize:'0.825rem',boxSizing:'border-box'}} />
                </div>
              ))}
              <div style={{display:'flex',gap:'0.5rem',marginTop:'0.75rem'}}>
                <button type="button" onClick={()=>setEditing(false)} style={{flex:1,padding:'0.5rem',borderRadius:6,border:'1px solid #D1D5DB',background:'white',cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{flex:1,padding:'0.5rem',borderRadius:6,border:'none',background:'#4472C4',color:'white',fontWeight:600,cursor:'pointer'}}>{saving?'...':'Save'}</button>
              </div>
            </form>
          )}
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:'1.25rem'}}>
          <div style={{background:'white',borderRadius:10,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',padding:'1.25rem'}}>
            <h2 style={{fontSize:'1rem',fontWeight:700,color:'#1a2340',marginBottom:'1rem'}}>Registrations ({registrations.length})</h2>
            {registrations.length===0 ? <p style={{color:'#9CA3AF',fontSize:'0.875rem'}}>No registrations yet.</p> : (
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>
                <thead><tr style={{background:'#F9FAFB'}}><th style={{padding:'0.5rem 0.75rem',textAlign:'left'}}>Course</th><th style={{padding:'0.5rem 0.75rem',textAlign:'left'}}>Start Date</th><th style={{padding:'0.5rem 0.75rem',textAlign:'left'}}>Status</th></tr></thead>
                <tbody>{registrations.map((r:any)=>(<tr key={r.id} style={{borderTop:'1px solid #F3F4F6'}}><td style={{padding:'0.75rem'}}>{r.course_name}</td><td style={{padding:'0.75rem',color:'#6B7280'}}>{r.start_date||'-'}</td><td style={{padding:'0.75rem'}}>{r.status}</td></tr>))}</tbody>
              </table>
            )}
          </div>
          <div style={{background:'white',borderRadius:10,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',padding:'1.25rem'}}>
            <h2 style={{fontSize:'1rem',fontWeight:700,color:'#1a2340',marginBottom:'1rem'}}>Invoices ({invoices.length})</h2>
            {invoices.length===0 ? <p style={{color:'#9CA3AF',fontSize:'0.875rem'}}>No invoices yet.</p> : (
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>
                <thead><tr style={{background:'#F9FAFB'}}><th style={{padding:'0.5rem 0.75rem',textAlign:'left'}}>Invoice No.</th><th style={{padding:'0.5rem 0.75rem',textAlign:'left'}}>Total</th><th style={{padding:'0.5rem 0.75rem',textAlign:'left'}}>Status</th></tr></thead>
                <tbody>{invoices.map((inv:any)=>(<tr key={inv.id} style={{borderTop:'1px solid #F3F4F6'}}><td style={{padding:'0.75rem',fontWeight:600,color:'#4472C4'}}>{inv.invoice_no}</td><td style={{padding:'0.75rem'}}>£{inv.total?.toFixed(2)}</td><td style={{padding:'0.75rem'}}>{inv.status}</td></tr>))}</tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
