import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendInvoiceEmail } from '@/lib/email';

function getNextInvoiceNo() {
  const last = db.prepare("SELECT invoice_no FROM invoices ORDER BY created_at DESC LIMIT 1").get() as any;
  if (!last) return 'INV-001';
  const num = parseInt(last.invoice_no.replace('INV-', '')) + 1;
  return `INV-${String(num).padStart(3, '0')}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';

  let where = status ? `WHERE i.status = '${status}'` : '';

  const invoices = db.prepare(`
    SELECT i.*,
           COALESCE(l.first_name || ' ' || l.last_name, e.name) as client_name,
           COALESCE(l.email, e.email) as client_email,
           COALESCE(SUM(p.amount), 0) as amount_paid
    FROM invoices i
    LEFT JOIN learners l ON i.learner_id = l.id
    LEFT JOIN employers e ON i.employer_id = e.id
    LEFT JOIN payments p ON p.invoice_id = i.id
    ${where}
    GROUP BY i.id
    ORDER BY i.created_at DESC
  `).all();

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const id = randomUUID();
  const invoiceNo = getNextInvoiceNo();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);
  const issueDate = new Date().toISOString();

  const subtotal = body.items.reduce((sum: number, item: any) => sum + (item.unitPrice * (item.quantity || 1)), 0);
  const vatAmount = subtotal * 0.2;
  const total = subtotal + vatAmount;

  db.prepare(`
    INSERT INTO invoices (id, invoice_no, learner_id, employer_id, created_by_id, due_date, subtotal, vat_amount, total, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)
  `).run(id, invoiceNo, body.learnerId || null, body.employerId || null,
         (session.user as any).id, dueDate.toISOString(), subtotal, vatAmount, total, body.notes || null);

  const itemObjects: Array<{ description: string; quantity: number; unit_price: number; total: number }> = [];

  for (const item of body.items) {
    const itemTotal = item.unitPrice * (item.quantity || 1);
    db.prepare(`
      INSERT INTO invoice_items (id, invoice_id, registration_id, description, quantity, unit_price, vat_rate, total)
      VALUES (?, ?, ?, ?, ?, ?, 20, ?)
    `).run(randomUUID(), id, item.registrationId || null, item.description,
           item.quantity || 1, item.unitPrice, itemTotal * 1.2);
    itemObjects.push({ description: item.description, quantity: item.quantity || 1, unit_price: item.unitPrice, total: itemTotal });
  }

  let emailSent = false;
  try {
    let recipientName = '';
    let recipientEmail = '';

    if (body.learnerId) {
      const learner = db.prepare('SELECT first_name, last_name, email FROM learners WHERE id = ?').get(body.learnerId) as any;
      if (learner?.email) {
        recipientName = `${learner.first_name} ${learner.last_name}`;
        recipientEmail = learner.email;
      }
    } else if (body.employerId) {
      const employer = db.prepare('SELECT name, email FROM employers WHERE id = ?').get(body.employerId) as any;
      if (employer?.email) {
        recipientName = employer.name;
        recipientEmail = employer.email;
      }
    }

    if (recipientEmail) {
      emailSent = await sendInvoiceEmail({
        invoiceNumber: invoiceNo,
        recipientName,
        recipientEmail,
        items: itemObjects,
        subtotal,
        vatAmount,
        totalAmount: total,
        dueDate: dueDate.toISOString(),
        issueDate,
      });
    }
  } catch (err) {
    console.error('[invoice] Email send failed:', err);
  }

  return NextResponse.json({ id, invoiceNo, emailSent }, { status: 201 });
}
