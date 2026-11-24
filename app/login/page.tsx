'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #2F5496 0%, #4472C4 60%, #6B9FD4 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Image
            src="/images/logo-white.png"
            alt="Magic Training"
            width={220}
            height={82}
            style={{ objectFit: 'contain', display: 'inline-block' }}
            priority
          />
          <p style={{ color: 'rgba(255,255,255,0.75)', marginTop: '0.5rem', fontSize: '0.85rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Staff Portal</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: '12px', padding: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1a2340', margin: '0 0 1.5rem' }}>Sign in to your account</h2>

          {error && (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@magic-training.co.uk"
                style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = '#4472C4')}
                onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: '100%', padding: '0.625rem 0.875rem', border: '1.5px solid #D1D5DB', borderRadius: '6px', fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.15s' }}
                onFocus={e => (e.target.style.borderColor = '#4472C4')}
                onBlur={e => (e.target.style.borderColor = '#D1D5DB')}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '0.75rem', background: loading ? '#93B4E0' : '#4472C4', color: 'white', border: 'none', borderRadius: '6px', fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          Staff access only · Magic Training Ltd
        </p>
      </div>
    </div>
  )
}
