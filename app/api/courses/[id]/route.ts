import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json();
  await client.execute({
    sql: `UPDATE courses SET name=?, category=?, duration=?, price=?, price_vat=?, description=?, venue=?, is_active=? WHERE id=?`,
    args: [body.name, body.category || null, body.duration || '', body.price || 0,
           body.priceVat ? 1 : 0, body.description || null, body.venue || null,
           body.isActive !== false ? 1 : 0, params.id],
  });
  const r = await client.execute({ sql: 'SELECT * FROM courses WHERE id = ?', args: [params.id] });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], name: row[1], category: row[2], duration: row[3], price: row[4],
    price_vat: row[5], description: row[6], venue: row[7], is_active: row[8],
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  await client.execute({ sql: 'DELETE FROM courses WHERE id = ?', args: [params.id] });
  return NextResponse.json({ success: true });
}
