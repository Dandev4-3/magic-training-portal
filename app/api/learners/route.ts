import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET() {
  await ensureDb();
  const res = await client.execute('SELECT * FROM learners ORDER BY last_name, first_name');
  const learners = res.rows.map(r => ({
    id: r[0], first_name: r[1], last_name: r[2], email: r[3], phone: r[4],
    address: r[5], date_of_birth: r[6], employer_id: r[7], notes: r[8], created_at: r[9],
  }));
  return NextResponse.json(learners);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const id = randomUUID();
  await client.execute({
    sql: `INSERT INTO learners (id, first_name, last_name, email, phone, address, date_of_birth, employer_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, body.firstName, body.lastName, body.email || null, body.phone || null,
           body.address || null, body.dateOfBirth || null, body.employerId || null, body.notes || null],
  });
  const r = await client.execute({ sql: 'SELECT * FROM learners WHERE id = ?', args: [id] });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], first_name: row[1], last_name: row[2], email: row[3], phone: row[4],
    address: row[5], date_of_birth: row[6], employer_id: row[7], notes: row[8],
  }, { status: 201 });
}
