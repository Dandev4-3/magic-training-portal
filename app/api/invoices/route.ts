import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET() {
  await ensureDb();
  const res = await client.execute(`
    SELECT i.*, l.first_name, l.last_name, e.name as employer_name
    FROM invoices i
    LEFT JOIN learners l ON i.learner_id = l.id
    LEFT JOIN employers e ON i.employer_id = e.id
    ORDER BY i.created_at DESC
  `);
  const invoices = res.rows.map(r => ({
    id: r[0], invoice_no: r[1], learner_id: r[2], employer_id: r[3], created_by_id: r[4],
    due_date: r[5], subtotal: r[6], vat_amount: r[7], total: r[8], status: r[9],
    notes: r[10], issued_date: r[11], paid_date: r[12], stripe_payment_intent_id: r[13],
    created_at: r[14], first_name: r[15], last_name: r[16], employer_name: r[17],
  }));
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const id = randomUUID();
  const countRes = await client.execute('SELECT COUNT(*) FROM invoices');
  const count = (countRes.rows[0][0] as number) + 1;
  const invoiceNo = `INV-${String(count).padStart(4, '0')}`;
  await client.execute({
    sql: `INSERT INTO invoices (id, invoice_no, learner_id, employer_id, created_by_id, due_date, subtotal, vat_amount, total, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, invoiceNo, body.learnerId || null, body.employerId || null, body.createdById || null,
           body.dueDate || null, body.subtotal || 0, body.vatAmount || 0, body.total || 0, body.notes || null],
  });
  const r = await client.execute({ sql: 'SELECT * FROM invoices WHERE id = ?', args: [id] });
  const row = r.rows[0];
  return NextResponse.json({ id: row[0], invoice_no: row[1], total: row[8] }, { status: 201 });
}
