import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  db.prepare(`UPDATE employers SET name=?, email=?, phone=?, address=?, contact_name=?, notes=? WHERE id=?`)
    .run(body.name, body.email || null, body.phone || null, body.address || null, body.contact_name || null, body.notes || null, id)
  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  db.prepare('DELETE FROM employers WHERE id=?').run(id)
  return NextResponse.json({ ok: true })
}
