import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = db.prepare(`
    SELECT i.*,
           COALESCE(l.first_name || ' ' || l.last_name, e.name) as client_name,
           l.email as client_email, l.phone as client_phone,
           l.address as client_address,
           e.email as employer_email
    FROM invoices i
    LEFT JOIN learners l ON i.learner_id = l.id
    LEFT JOIN employers e ON i.employer_id = e.id
    WHERE i.id = ?
  `).get(id);

  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(id);
  const payments = db.prepare(`
    SELECT p.*, u.name as recorded_by_name FROM payments p
    JOIN users u ON p.recorded_by_id = u.id
    WHERE p.invoice_id = ? ORDER BY p.payment_date DESC
  `).all(id);

  const inv = invoice as any;
  const clientEmail = inv.client_email || inv.employer_email;
  return NextResponse.json({ ...inv, client_email: clientEmail, items, payments });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  db.prepare('UPDATE invoices SET status = ? WHERE id = ?').run(body.status, id);
  return NextResponse.json({ success: true });
}
