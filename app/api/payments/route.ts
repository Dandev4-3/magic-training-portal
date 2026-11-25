import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET() {
  await ensureDb();
  const res = await client.execute('SELECT * FROM payments ORDER BY created_at DESC');
  const payments = res.rows.map(r => ({
    id: r[0], invoice_id: r[1], recorded_by_id: r[2], amount: r[3], method: r[4],
    reference: r[5], ledger: r[6], payment_date: r[7], notes: r[8], created_at: r[9],
  }));
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const id = randomUUID();
  await client.execute({
    sql: `INSERT INTO payments (id, invoice_id, recorded_by_id, amount, method, reference, ledger, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, body.invoiceId, body.recordedById || null, body.amount, body.method || 'BANK',
           body.reference || null, body.ledger || 'BANK', body.notes || null],
  });
  await client.execute({
    sql: `UPDATE invoices SET status='PAID', paid_date=CURRENT_TIMESTAMP WHERE id=?`,
    args: [body.invoiceId],
  });
  return NextResponse.json({ id, success: true }, { status: 201 });
}
