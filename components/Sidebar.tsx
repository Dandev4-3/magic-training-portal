'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '⊞' },
  { href: '/learners', label: 'Learners', icon: '👤' },
  { href: '/registrations', label: 'Registrations', icon: '📋' },
  { href: '/courses', label: 'Courses', icon: '🎓' },
  { href: '/invoices', label: 'Invoices', icon: '📄' },
  { href: '/finance', label: 'Finance', icon: '💰' },
  { href: '/staff', label: 'Staff', icon: '👥' },
  { href: '/employers', label: 'Employers', icon: '🏢' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#1a2340',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Image
          src="/images/logo-white.png"
          alt="Magic Training"
          width={160}
          height={60}
          style={{ objectFit: 'contain', objectPosition: 'left' }}
          priority
        />
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.68rem', marginTop: 4, letterSpacing: '0.05em' }}>STAFF PORTAL</div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', overflowY: 'auto' }}>
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.625rem',
                padding: '0.6rem 0.875rem',
                borderRadius: '7px',
                marginBottom: '0.125rem',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                color: active ? 'white' : 'rgba(255,255,255,0.6)',
                background: active ? '#4472C4' : 'transparent',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User / Sign out */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ marginBottom: '0.5rem', padding: '0 0.5rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.825rem', fontWeight: 500 }}>{session?.user?.name || session?.user?.email}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', marginTop: 2 }}>
            {(session?.user as { role?: string })?.role || 'Staff'}
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{ width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', border: 'none', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.15s' }}
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
