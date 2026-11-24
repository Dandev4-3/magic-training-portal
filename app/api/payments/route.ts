import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const id = randomUUID();

  db.prepare(`
    INSERT INTO payments (id, invoice_id, recorded_by_id, amount, method, reference, ledger, payment_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.invoiceId, (session.user as any).id, body.amount, body.method,
         body.reference || null, body.ledger || 'BANK', body.paymentDate || new Date().toISOString(),
         body.notes || null);

  const invoice = db.prepare('SELECT total FROM invoices WHERE id = ?').get(body.invoiceId) as any;
  const totalPaid = (db.prepare('SELECT COALESCE(SUM(amount),0) as v FROM payments WHERE invoice_id = ?').get(body.invoiceId) as any).v;

  if (totalPaid >= invoice.total) {
    db.prepare("UPDATE invoices SET status = 'PAID' WHERE id = ?").run(body.invoiceId);
  } else if (totalPaid > 0) {
    db.prepare("UPDATE invoices SET status = 'PARTIAL' WHERE id = ?").run(body.invoiceId);
  }

  return NextResponse.json({ id }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ledger = searchParams.get('ledger') || '';
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (ledger) { where += ' AND p.ledger = ?'; params.push(ledger); }
  if (from) { where += ' AND p.payment_date >= ?'; params.push(from); }
  if (to) { where += ' AND p.payment_date <= ?'; params.push(to); }

  const payments = db.prepare(`
    SELECT p.*, i.invoice_no,
           COALESCE(l.first_name || ' ' || l.last_name, e.name) as client_name,
           u.name as recorded_by_name
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    LEFT JOIN learners l ON i.learner_id = l.id
    LEFT JOIN employers e ON i.employer_id = e.id
    JOIN users u ON p.recorded_by_id = u.id
    ${where}
    ORDER BY p.payment_date DESC
  `).all(...params);

  const summary = db.prepare(`
    SELECT
      ledger,
      COALESCE(SUM(amount),0) as total,
      COUNT(*) as count
    FROM payments p ${where}
    GROUP BY ledger
  `).all(...params);

  return NextResponse.json({ payments, summary });
}
