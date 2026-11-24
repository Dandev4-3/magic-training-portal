'use client'

import { useState, useEffect } from 'react'

interface Payment {
  id: string
  invoice_no: string
  client_name: string
  amount: number
  method: string
  reference: string | null
  paid_at: string
  ledger: string
}

interface Summary {
  totalRevenue: number
  cashRevenue: number
  bankRevenue: number
  pendingRevenue: number
  overdueRevenue: number
  monthlyRevenue: Array<{ month: string; total: number }>
}

export default function FinancePage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [ledger, setLedger] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [invoices, setInvoices] = useState<any[]>([])
  const [form, setForm] = useState({ invoiceId: '', amount: '', method: 'BANK_TRANSFER', reference: '', ledger: 'BANK', paidAt: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadPayments()
    fetch('/api/invoices?status=PENDING').then(r => r.json()).then(d => setInvoices(d || []))
  }, [ledger])

  async function loadPayments() {
    setLoading(true)
    const qs = ledger ? `?ledger=${ledger}` : ''
    const data = await fetch(`/api/payments${qs}`).then(r => r.json())
    setPayments(data.payments || [])
    setSummary(data.summary || null)
    setLoading(false)
  }

  async function handleRecord(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setShowModal(false)
    setForm({ invoiceId: '', amount: '', method: 'BANK_TRANSFER', reference: '', ledger: 'BANK', paidAt: new Date().toISOString().slice(0, 10) })
    loadPayments()
  }

  const methodLabel: Record<string, string> = {
    BANK_TRANSFER: 'Bank Transfer',
    CARD: 'Card',
    CASH: 'Cash',
    CHEQUE: 'Cheque',
    STRIPE: 'Stripe',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2340' }}>Finance</h1>
        <button onClick={() => setShowModal(true)} style={{ background: '#4472C4', color: 'white', border: 'none', borderRadius: 7, padding: '0.6rem 1.25rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem' }}>
          + Record Payment
        </button>
      </div>

      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Collected', value: `£${summary.totalRevenue.toFixed(2)}`, color: '#4472C4' },
            { label: 'Bank Receipts', value: `£${summary.bankRevenue.toFixed(2)}`, color: '#059669' },
            { label: 'Cash Receipts', value: `£${summary.cashRevenue.toFixed(2)}`, color: '#7C3AED' },
            { label: 'Pending', value: `£${summary.pendingRevenue.toFixed(2)}`, color: '#D97706' },
            { label: 'Overdue', value: `£${summary.overdueRevenue.toFixed(2)}`, color: '#DC2626' },
          ].map(card => (
            <div key={card.label} style={{ background: 'white', borderRadius: 10, padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}` }}>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: card.color }}>{card.value}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 10, padding: '1rem 1.25rem', marginBottom: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280' }}>Ledger:</span>
        {['', 'BANK', 'CASH'].map(l => (
          <button key={l} onClick={() => setLedger(l)} style={{
            padding: '0.4rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
            background: ledger === l ? '#4472C4' : '#F3F4F6',
            color: ledger === l ? 'white' : '#374151',
          }}>
            {l || 'All'}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>Loading…</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF' }}>No payments recorded yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Date', 'Invoice', 'Client', 'Method', 'Ledger', 'Reference', 'Amount'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.825rem', color: '#6B7280' }}>{new Date(p.paid_at).toLocaleDateString('en-GB')}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: '#4472C4' }}>{p.invoice_no}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem' }}>{p.client_name || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.825rem' }}>{methodLabel[p.method] || p.method}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 4, fontSize: '0.72rem', fontWeight: 600, background: p.ledger === 'CASH' ? '#F3E8FF' : '#EBF0FA', color: p.ledger === 'CASH' ? '#7C3AED' : '#2F5496' }}>{p.ledger}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.825rem', color: '#6B7280' }}>{p.reference || '—'}</td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, fontSize: '0.95rem', color: '#059669' }}>£{p.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '2rem', width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1a2340', margin: 0 }}>Record Payment</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#9CA3AF' }}>✕</button>
            </div>
            <form onSubmit={handleRecord}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Invoice *</label>
                  <select required value={form.invoiceId} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem' }}>
                    <option value="">— Select invoice —</option>
                    {invoices.map(inv => <option key={inv.id} value={inv.id}>{inv.invoice_no} — {inv.client_name} (£{inv.total?.toFixed(2)})</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Amount (£) *</label>
                    <input required type="number" min={0} step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Date *</label>
                    <input required type="date" value={form.paidAt} onChange={e => setForm(f => ({ ...f, paidAt: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Method *</label>
                    <select required value={form.method} onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem' }}>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                      <option value="CARD">Card</option>
                      <option value="CASH">Cash</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="STRIPE">Stripe</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Ledger *</label>
                    <select required value={form.ledger} onChange={e => setForm(f => ({ ...f, ledger: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem' }}>
                      <option value="BANK">Bank</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 4 }}>Reference (optional)</label>
                  <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="e.g. BACS ref or cheque no."
                    style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 7, border: '1px solid #D1D5DB', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.6rem 1.25rem', borderRadius: 7, border: '1px solid #D1D5DB', background: 'white', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: 7, border: 'none', background: '#4472C4', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                  {saving ? 'Saving…' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
