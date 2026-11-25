import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET() {
  await ensureDb();
  const res = await client.execute('SELECT * FROM courses ORDER BY category, name');
  const courses = res.rows.map(r => ({
    id: r[0], name: r[1], category: r[2], duration: r[3], price: r[4],
    price_vat: r[5], description: r[6], venue: r[7], is_active: r[8], created_at: r[9],
  }));
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const id = randomUUID();
  await client.execute({
    sql: `INSERT INTO courses (id, name, category, duration, price, price_vat, description, venue)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, body.name, body.category || null, body.duration || '', body.price || 0,
           body.priceVat ? 1 : 0, body.description || null, body.venue || null],
  });
  const r = await client.execute({ sql: 'SELECT * FROM courses WHERE id = ?', args: [id] });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], name: row[1], category: row[2], duration: row[3], price: row[4],
    price_vat: row[5], description: row[6], venue: row[7], is_active: row[8],
  }, { status: 201 });
}
