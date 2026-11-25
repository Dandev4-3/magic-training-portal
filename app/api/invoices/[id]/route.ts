import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const r = await client.execute({ sql: 'SELECT * FROM invoices WHERE id = ?', args: [params.id] });
  if (r.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const row = r.rows[0];
  const items = await client.execute({ sql: 'SELECT * FROM invoice_items WHERE invoice_id = ?', args: [params.id] });
  return NextResponse.json({
    id: row[0], invoice_no: row[1], learner_id: row[2], employer_id: row[3],
    due_date: row[5], subtotal: row[6], vat_amount: row[7], total: row[8],
    status: row[9], notes: row[10], issued_date: row[11],
    items: items.rows.map(i => ({ id: i[0], description: i[4], quantity: i[5], unit_price: i[6], total: i[8] })),
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json();
  await client.execute({
    sql: `UPDATE invoices SET status=?, due_date=?, notes=?, paid_date=? WHERE id=?`,
    args: [body.status || 'PENDING', body.dueDate || null, body.notes || null, body.paidDate || null, params.id],
  });
  const r = await client.execute({ sql: 'SELECT * FROM invoices WHERE id = ?', args: [params.id] });
  const row = r.rows[0];
  return NextResponse.json({ id: row[0], invoice_no: row[1], status: row[9], total: row[8] });
}
