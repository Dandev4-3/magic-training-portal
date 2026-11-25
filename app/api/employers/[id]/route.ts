import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json();
  await client.execute({
    sql: `UPDATE employers SET name=?, contact=?, email=?, phone=?, address=?, contact_name=?, notes=? WHERE id=?`,
    args: [body.name, body.contact || null, body.email || null, body.phone || null,
           body.address || null, body.contactName || null, body.notes || null, params.id],
  });
  const r = await client.execute({ sql: 'SELECT * FROM employers WHERE id = ?', args: [params.id] });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], name: row[1], contact: row[2], email: row[3], phone: row[4],
    address: row[5], contact_name: row[6], notes: row[7],
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  await client.execute({ sql: 'DELETE FROM employers WHERE id = ?', args: [params.id] });
  return NextResponse.json({ success: true });
}
