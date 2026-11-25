import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET() {
  await ensureDb();
  const res = await client.execute('SELECT * FROM employers ORDER BY name');
  const employers = res.rows.map(r => ({
    id: r[0], name: r[1], contact: r[2], email: r[3], phone: r[4],
    address: r[5], contact_name: r[6], notes: r[7], created_at: r[8],
  }));
  return NextResponse.json(employers);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const id = randomUUID();
  await client.execute({
    sql: `INSERT INTO employers (id, name, contact, email, phone, address, contact_name, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, body.name, body.contact || null, body.email || null, body.phone || null,
           body.address || null, body.contactName || null, body.notes || null],
  });
  const r = await client.execute({ sql: 'SELECT * FROM employers WHERE id = ?', args: [id] });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], name: row[1], contact: row[2], email: row[3], phone: row[4],
    address: row[5], contact_name: row[6], notes: row[7],
  }, { status: 201 });
}
