import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const learner = db.prepare(`
    SELECT l.*, e.name as employer_name
    FROM learners l
    LEFT JOIN employers e ON l.employer_id = e.id
    WHERE l.id = ?
  `).get(id)

  if (!learner) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(learner)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json()
  const { first_name, last_name, email, phone, date_of_birth, address, employer_id, notes } = body

  db.prepare(`
    UPDATE learners SET
      first_name = ?, last_name = ?, email = ?, phone = ?,
      date_of_birth = ?, address = ?, employer_id = ?, notes = ?
    WHERE id = ?
  `).run(first_name, last_name, email || null, phone || null,
         date_of_birth || null, address || null, employer_id || null, notes || null, id)

  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  db.prepare('DELETE FROM learners WHERE id = ?').run(id)
  return NextResponse.json({ success: true })
}
