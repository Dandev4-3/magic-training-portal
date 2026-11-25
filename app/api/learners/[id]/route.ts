import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const r = await client.execute({ sql: 'SELECT * FROM learners WHERE id = ?', args: [params.id] });
  if (r.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], first_name: row[1], last_name: row[2], email: row[3], phone: row[4],
    address: row[5], date_of_birth: row[6], employer_id: row[7], notes: row[8],
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json();
  await client.execute({
    sql: `UPDATE learners SET first_name=?, last_name=?, email=?, phone=?, address=?, date_of_birth=?, employer_id=?, notes=? WHERE id=?`,
    args: [body.firstName, body.lastName, body.email || null, body.phone || null,
           body.address || null, body.dateOfBirth || null, body.employerId || null, body.notes || null, params.id],
  });
  const r = await client.execute({ sql: 'SELECT * FROM learners WHERE id = ?', args: [params.id] });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], first_name: row[1], last_name: row[2], email: row[3], phone: row[4],
    address: row[5], date_of_birth: row[6], employer_id: row[7], notes: row[8],
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  await client.execute({ sql: 'DELETE FROM learners WHERE id = ?', args: [params.id] });
  return NextResponse.json({ success: true });
}
