'use client'
import { useState, useEffect } from 'react'

export default function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name:'', category:'', duration:'', price:'', price_vat:'1', description:'' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/courses').then(r=>r.json()).then(d => { setCourses(d); setLoading(false) })
  }, [])

  async function handleCreate(e:React.FormEvent) {
    e.preventDefault(); setSaving(true)
    await fetch('/api/courses',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...form,price:parseFloat(form.price)||0,price_vat:parseInt(form.price_vat)||1})})
    setSaving(false); setShowModal(false); setForm({name:'',category:'',duration:'',price:'',price_vat:'1',description:''})
    fetch('/api/courses').then(r=>r.json()).then(setCourses)
  }

  const categories = ['All',...Array.from(new Set(courses.map((c:any)=>c.category).filter(Boolean)))]
  const filtered = courses.filter((c:any) => {
    if (catFilter !== 'All' && c.category !== catFilter) return false
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const grouped = filtered.reduce((acc:any, c:any) => { const cat = c.category||'Other'; if (!acc[cat]) acc[cat]=[]; acc[cat].push(c); return acc }, {})

  return (
    <div style={{padding:'2rem'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1.5rem'}}>
        <h1 style={{fontSize:'1.5rem',fontWeight:700,color:'#1a2340'}}>Courses</h1>
        <button onClick={()=>setShowModal(true)} style={{background:'#4472C4',color:'white',border:'none',borderRadius:7,padding:'0.6rem 1.25rem',fontWeight:600,cursor:'pointer',fontSize:'0.875rem'}}>+ Add Course</button>
      </div>
      <div style={{display:'flex',gap:'0.75rem',marginBottom:'1.5rem',flexWrap:'wrap',alignItems:'center'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search courses..." style={{padding:'0.5rem 0.875rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',width:260}} />
        <div style={{display:'flex',gap:'0.5rem',flexWrap:'wrap'}}>
          {categories.map(cat=><button key={cat} onClick={()=>setCatFilter(cat)} style={{padding:'0.4rem 0.875rem',borderRadius:6,border:'1px solid',borderColor:catFilter===cat?'#4472C4':'#D1D5DB',background:catFilter===cat?'#4472C4':'white',color:catFilter===cat?'white':'#374151',fontWeight:600,cursor:'pointer',fontSize:'0.78rem'}}>{cat}</button>)}
        </div>
      </div>
      {loading ? <div style={{textAlign:'center',color:'#9CA3AF',padding:'3rem'}}>Loading...</div> : Object.entries(grouped).map(([cat,list]:any)=>(
        <div key={cat} style={{marginBottom:'2rem'}}>
          <h2 style={{fontSize:'0.9rem',fontWeight:700,color:'#4472C4',textTransform:'uppercase',letterSpacing:'0.05em',marginBottom:'0.75rem'}}>{cat}</h2>
          <div style={{background:'white',borderRadius:10,boxShadow:'0 1px 4px rgba(0,0,0,0.06)',overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:'0.875rem'}}>
              <thead><tr style={{background:'#F9FAFB',borderBottom:'1px solid #E5E7EB'}}>{['Course Name','Duration','Price (excl. VAT)',''].map(h=><th key={h} style={{padding:'0.625rem 1rem',textAlign:'left',fontSize:'0.75rem',fontWeight:600,color:'#6B7280',textTransform:'uppercase'}}>{h}</th>)}</tr></thead>
              <tbody>
                {list.map((c:any)=>(
                  <tr key={c.id} style={{borderBottom:'1px solid #F3F4F6'}}>
                    <td style={{padding:'0.875rem 1rem',fontWeight:500,color:'#1a2340'}}>{c.name}</td>
                    <td style={{padding:'0.875rem 1rem',color:'#6B7280',fontSize:'0.825rem'}}>{c.duration||'-'}</td>
                    <td style={{padding:'0.875rem 1rem',fontWeight:600,color:'#374151'}}>£{c.price?.toLocaleString()}{c.price_vat ? ' +VAT' : ''}</td>
                    <td style={{padding:'0.875rem 1rem'}}></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'1rem'}}>
          <div style={{background:'white',borderRadius:12,padding:'2rem',width:'100%',maxWidth:480}}>
            <h2 style={{fontSize:'1.1rem',fontWeight:700,color:'#1a2340',marginBottom:'1.5rem'}}>Add Course</h2>
            <form onSubmit={handleCreate}>
              <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Course Name *</label><input required value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',boxSizing:'border-box'}} /></div>
                <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Category</label><input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="e.g. NVQ Level 2" style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',boxSizing:'border-box'}} /></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem'}}>
                  <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Duration</label><input value={form.duration} onChange={e=>setForm(f=>({...f,duration:e.target.value}))} placeholder="e.g. 3 days" style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',boxSizing:'border-box'}} /></div>
                  <div><label style={{display:'block',fontSize:'0.8rem',fontWeight:600,color:'#374151',marginBottom:4}}>Price (£)</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} style={{width:'100%',padding:'0.5rem 0.75rem',borderRadius:7,border:'1px solid #D1D5DB',fontSize:'0.875rem',boxSizing:'border-box'}} /></div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'0.5rem'}}><input type="checkbox" checked={form.price_vat==='1'} onChange={e=>setForm(f=>({...f,price_vat:e.target.checked?'1':'0'}))} id="vat" /><label htmlFor="vat" style={{fontSize:'0.875rem',color:'#374151'}}>Price excludes VAT (+20%)</label></div>
              </div>
              <div style={{display:'flex',gap:'0.75rem',justifyContent:'flex-end',marginTop:'1.5rem'}}>
                <button type="button" onClick={()=>setShowModal(false)} style={{padding:'0.6rem 1.25rem',borderRadius:7,border:'1px solid #D1D5DB',background:'white',cursor:'pointer'}}>Cancel</button>
                <button type="submit" disabled={saving} style={{padding:'0.6rem 1.5rem',borderRadius:7,border:'none',background:'#4472C4',color:'white',fontWeight:600,cursor:'pointer'}}>{saving?'Saving...':'Add Course'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
