'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardData {
  totalLearners: number
  activeCourses: number
  completedCourses: number
  unallocated: number
  pendingInvoices: number
  outstandingBalance: number
  totalReceived: number
  recentRegistrations: Array<{
    id: number
    learner_name: string
    course_name: string
    start_date: string
    status: string
    allocation_status: string
  }>
  pendingInvoiceList: Array<{
    id: number
    invoice_number: string
    learner_name: string
    total_amount: number
    due_date: string
    status: string
  }>
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'white', borderRadius: '10px', padding: '1.25rem 1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', borderLeft: `4px solid ${color || '#4472C4'}` }}>
      <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1a2340' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: '#9CA3AF', marginTop: '0.25rem' }}>{sub}</div>}
    </div>
  )
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading dashboard...</div>
  )
  if (!data) return null

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2340', margin: 0 }}>Dashboard</h1>
        <p style={{ color: '#6B7280', marginTop: '0.25rem', fontSize: '0.9rem' }}>Overview of Magic Training operations</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard label="Total Learners" value={data.totalLearners} color="#4472C4" />
        <StatCard label="Active Courses" value={data.activeCourses} color="#2F5496" />
        <StatCard label="Completed" value={data.completedCourses} color="#059669" />
        <StatCard label="Unallocated" value={data.unallocated} color="#F59E0B" sub="Need trainer" />
        <StatCard label="Pending Invoices" value={data.pendingInvoices} color="#EF4444" />
        <StatCard label="Outstanding" value={`£${data.outstandingBalance.toLocaleString()}`} color="#DC2626" />
        <StatCard label="Total Received" value={`£${data.totalReceived.toLocaleString()}`} color="#059669" />
      </div>
      <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>Portal loaded successfully. Data populates after first registration.</p>
    </div>
  )
}
