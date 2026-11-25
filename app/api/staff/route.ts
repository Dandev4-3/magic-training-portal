import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET() {
  await ensureDb();
  const res = await client.execute('SELECT * FROM staff ORDER BY name');
  const staff = res.rows.map(r => ({
    id: r[0], name: r[1], email: r[2], phone: r[3], role: r[4], is_active: r[5], created_at: r[6],
  }));
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const id = randomUUID();
  await client.execute({
    sql: `INSERT INTO staff (id, name, email, phone, role) VALUES (?, ?, ?, ?, ?)`,
    args: [id, body.name, body.email || null, body.phone || null, body.role || 'trainer'],
  });
  const r = await client.execute({ sql: 'SELECT * FROM staff WHERE id = ?', args: [id] });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], name: row[1], email: row[2], phone: row[3], role: row[4], is_active: row[5],
  }, { status: 201 });
}
