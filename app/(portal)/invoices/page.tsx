'use client'

import { useState, useEffect } from 'react'

interface Invoice {
  id: string
  invoice_no: string
  client_name: string
  client_email: string
  subtotal: number
  vat_amount: number
  total: number
  amount_paid: number
  status: string
  due_date: string
  created_at: string
  notes: string | null
}

interface Learner { id: string; first_name: string; last_name: string; email: string }
interface Employer { id: string; name: string; email: string }
interface Course { id: string; name: string; price: number }

const statusColor: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#FEF3C7', color: '#92400E' },
  PAID: { bg: '#D1FAE5', color: '#065F46' },
  OVERDUE: { bg: '#FEE2E2', color: '#991B1B' },
  CANCELLED: { bg: '#F3F4F6', color: '#6B7280' },
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [viewInvoice, setViewInvoice] = useState<any>(null)
  const [learners, setLearners] = useState<Learner[]>([])
  const [employers, setEmployers] = useState<Employer[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    learnerId: '',
    employerId: '',
    notes: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
  })

  useEffect(() => {
    loadInvoices()
    fetch('/api/learners?limit=500').then(r => r.json()).then(d => setLearners(d.learners || []))
    fetch('/api/employers').then(r => r.json()).then(d => setEmployers(d || []))
    fetch('/api/courses').then(r => r.json()).then(d => setCourses(d || []))
  }, [status])

  async function loadInvoices() {
    setLoading(true)
    const qs = status ? `?status=${status}` : ''
    const data = await fetch(`/api/invoices${qs}`).then(r => r.json())
    setInvoices(data)
    setLoading(false)
  }

  async function viewDetail(id: string) {
    const data = await fetch(`/api/invoices/${id}`).then(r => r.json())
    setViewInvoice(data)
  }

  async function markPaid(id: string) {
    if (!confirm('Mark this invoice as PAID?')) return
    await fetch(`/api/invoices/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'PAID' }) })
    loadInvoices()
    if (viewInvoice?.id === id) viewDetail(id)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      learnerId: form.learnerId || null,
      employerId: form.employerId || null,
      notes: form.notes,
      items: form.items.filter(i => i.description.trim()),
    }
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      setShowModal(false)
      setForm({ learnerId: '', employerId: '', notes: '', items: [{ description: '', quantity: 1, unitPrice: 0 }] })
      loadInvoices()
    }
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { description: '', quantity: 1, unitPrice: 0 }] }))
  }

  function removeItem(i: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  }

  function updateItem(i: number, field: string, value: any) {
    setForm(f => {
      const items = [...f.items]
      items[i] = { ...items[i], [field]: value }
      return { ...f, items }
    })
  }

  function fillFromCourse(i: number, courseId: string) {
    const course = courses.find(c => c.id === courseId)
    if (course) updateItem(i, 'description', course.name)
    if (course) updateItem(i, 'unitPrice', course.price)
  }

  const subtotal = form.items.reduce((s, item) => s + (item.unitPrice * item.quantity), 0)
  const vat = subtotal * 0.2
  const total = subtotal + vat

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2340' }}>Invoices</h1>
        <button onClick={() => setShowModal(true)} style={{ background: '#4472C4', color: 'white', border: 'none', borderRadius: 7, padding: '0.6rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + New Invoice
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {['', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setStatus(s)} style={{
            padding: '0.4rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            background: status === s ? '#4472C4' : '#F3F4F6',
            color: status === s ? 'white' : '#374151',
          }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading…</div>
        ) : invoices.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No invoices found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Invoice No.', 'Client', 'Issued', 'Due', 'Total', 'Paid', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => {
                const sc = statusColor[inv.status] || statusColor.PENDING
                const outstanding = inv.total - inv.amount_paid
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, color: '#1a2340', fontSize: '0.875rem' }}>{inv.invoice_no}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>
                      <div style={{ fontWeight: 500 }}>{inv.client_name || '—'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{inv.client_email}</div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.825rem', color: '#6B7280' }}>{new Date(inv.created_at).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.825rem', color: '#6B7280' }}>{new Date(inv.due_date).toLocaleDateString('en-GB')}</td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 600, fontSize: '0.875rem' }}>£{inv.total.toFixed(2)}</td>
                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: outstanding > 0 ? '#DC2626' : '#059669', fontWeight: 500 }}>
                      {outstanding > 0 ? `-£${outstanding.toFixed(2)}` : '✓ Paid'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.color }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1rem', display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => viewDetail(inv.id)} style={{ background: '#EBF0FA', color: '#4472C4', border: 'none', borderRadius: 5, padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>View</button>
                      {inv.status === 'PENDING' && (
                        <button onClick={() => markPaid(inv.id)} style={{ background: '#D1FAE5', color: '#065F46', border: 'none', borderRadius: 5, padding: '0.3rem 0.7rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>Mark Paid</button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '2rem 1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 680 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1a2340', margin: 0 }}>New Invoice</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Learner (optional)</label>
                  <select value={form.learnerId} onChange={e => setForm(f => ({ ...f, learnerId: e.target.value, employerId: '' }))}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem' }}>
                    <option value="">— Select learner —</option>
                    {learners.map(l => <option key={l.id} value={l.id}>{l.first_name} {l.last_name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Employer (optional)</label>
                  <select value={form.employerId} onChange={e => setForm(f => ({ ...f, employerId: e.target.value, learnerId: '' }))}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem' }}>
                    <option value="">— Select employer —</option>
                    {employers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Line items */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151' }}>Line Items</label>
                  <button type="button" onClick={addItem} style={{ background: '#EBF0FA', color: '#4472C4', border: 'none', borderRadius: 5, padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>+ Add Item</button>
                </div>
                <div style={{ background: '#F9FAFB', borderRadius: 8, padding: '0.75rem' }}>
                  {form.items.map((item, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto auto', gap: '0.5rem', marginBottom: i < form.items.length - 1 ? '0.5rem' : 0, alignItems: 'center' }}>
                      <div>
                        <select onChange={e => { if (e.target.value) fillFromCourse(i, e.target.value) }}
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 5, border: '1px solid #D1D5DB', fontSize: '0.75rem', marginBottom: 3, color: '#6B7280' }}>
                          <option value="">Fill from course…</option>
                          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <input value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} placeholder="Description" required
                          style={{ width: '100%', padding: '0.4rem', borderRadius: 5, border: '1px solid #D1D5DB', fontSize: '0.825rem', boxSizing: 'border-box' }} />
                      </div>
                      <input type="number" min={1} value={item.quantity} onChange={e => updateItem(i, 'quantity', parseInt(e.target.value) || 1)} placeholder="Qty"
                        style={{ padding: '0.4rem', borderRadius: 5, border: '1px solid #D1D5DB', fontSize: '0.825rem', textAlign: 'center' }} />
                      <input type="number" min={0} step="0.01" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', parseFloat(e.target.value) || 0)} placeholder="Price (ex VAT)"
                        style={{ padding: '0.4rem', borderRadius: 5, border: '1px solid #D1D5DB', fontSize: '0.825rem' }} />
                      <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>£{(item.unitPrice * item.quantity).toFixed(2)}</span>
                      {form.items.length > 1 && (
                        <button type="button" onClick={() => removeItem(i)} style={{ background: '#FEE2E2', color: '#DC2626', border: 'none', borderRadius: 4, padding: '0.25rem 0.4rem', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* VAT preview */}
              <div style={{ background: '#EBF0FA', borderRadius: 8, padding: '1rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ textAlign: 'right', minWidth: 200 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.825rem', color: '#6B7280', marginBottom: 4 }}>
                    <span>Subtotal (ex VAT)</span><span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '0.825rem', color: '#6B7280', marginBottom: 6 }}>
                    <span>VAT (20%)</span><span>£{vat.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '2rem', fontSize: '1rem', fontWeight: 700, color: '#1a2340', borderTop: '1px solid #BFCFE8', paddingTop: 6, marginTop: 4 }}>
                    <span>Total</span><span>£{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Notes (optional)</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>

              <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '1rem' }}>💡 Invoice will be automatically emailed to the contact on creation.</p>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: 7, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: 7, border: 'none', background: '#4472C4', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Creating…' : 'Create & Send Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View invoice panel */}
      {viewInvoice && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 100, overflowY: 'auto', padding: '2rem 1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 600, overflow: 'hidden' }}>
            <div style={{ background: '#2F5496', padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: 'white', fontSize: '1.4rem', fontWeight: 700 }}>{viewInvoice.invoice_no}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.825rem', marginTop: 4 }}>Magic Training Ltd</div>
                </div>
                <button onClick={() => setViewInvoice(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 6, padding: '0.4rem 0.75rem', cursor: 'pointer' }}>Close</button>
              </div>
            </div>
            <div style={{ padding: '1.5rem 2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Billed To</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{viewInvoice.client_name}</div>
                  <div style={{ fontSize: '0.825rem', color: '#6B7280' }}>{viewInvoice.client_email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Due Date</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{new Date(viewInvoice.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    {['Description', 'Qty', 'Unit Price', 'Total'].map(h => (
                      <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: h === 'Description' ? 'left' : 'right', fontSize: '0.72rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(viewInvoice.items || []).map((item: any, i: number) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem' }}>{item.description}</td>
                      <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem', textAlign: 'right' }}>£{item.unit_price.toFixed(2)}</td>
                      <td style={{ padding: '0.625rem 0.75rem', fontSize: '0.875rem', textAlign: 'right', fontWeight: 600 }}>£{(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.825rem', color: '#6B7280' }}><span>Subtotal</span><span>£{viewInvoice.subtotal?.toFixed(2)}</span></div>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '0.825rem', color: '#6B7280' }}><span>VAT 20%</span><span>£{viewInvoice.vat_amount?.toFixed(2)}</span></div>
                <div style={{ display: 'flex', gap: '2rem', fontSize: '1rem', fontWeight: 700, color: '#1a2340', borderTop: '1px solid #E5E7EB', paddingTop: 6, marginTop: 4 }}><span>Total</span><span>£{viewInvoice.total?.toFixed(2)}</span></div>
              </div>
              {viewInvoice.status === 'PENDING' && (
                <button onClick={() => markPaid(viewInvoice.id)} style={{ width: '100%', background: '#4472C4', color: 'white', border: 'none', borderRadius: 7, padding: '0.7rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                  Mark as Paid
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
