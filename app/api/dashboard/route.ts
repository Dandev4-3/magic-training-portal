import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const totalLearners = (db.prepare('SELECT COUNT(*) as c FROM learners').get() as any).c;
    const activeCourses = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE course_status = 'ACTIVE'").get() as any).c;
    const completedCourses = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE course_status = 'COMPLETED'").get() as any).c;
    const unallocated = (db.prepare("SELECT COUNT(*) as c FROM registrations WHERE allocation_status = 'NOT_ALLOCATED' AND course_status = 'ACTIVE'").get() as any).c;
    const pendingInvoices = (db.prepare("SELECT COUNT(*) as c FROM invoices WHERE status = 'PENDING'").get() as any).c;

    const outstandingResult = db.prepare("SELECT COALESCE(SUM(total - COALESCE(paid,0)),0) as v FROM invoices LEFT JOIN (SELECT invoice_id, SUM(amount) as paid FROM payments GROUP BY invoice_id) p ON invoices.id = p.invoice_id WHERE invoices.status IN ('PENDING','PARTIAL')").get() as any;
    const outstanding = outstandingResult.v || 0;

    const totalReceived = (db.prepare("SELECT COALESCE(SUM(amount),0) as v FROM payments").get() as any).v || 0;

    const recentRegistrations = db.prepare(`
      SELECT r.id, l.first_name || ' ' || l.last_name as learner_name, c.name as course_name,
             r.course_status, r.allocation_status, r.registration_date
      FROM registrations r
      JOIN learners l ON r.learner_id = l.id
      JOIN courses c ON r.course_id = c.id
      ORDER BY r.created_at DESC LIMIT 10
    `).all();

    const pendingInvoiceList = db.prepare(`
      SELECT i.id, i.invoice_no,
             COALESCE(l.first_name || ' ' || l.last_name, e.name, 'Unknown') as client_name,
             i.total, i.due_date, i.status
      FROM invoices i
      LEFT JOIN learners l ON i.learner_id = l.id
      LEFT JOIN employers e ON i.employer_id = e.id
      WHERE i.status IN ('PENDING', 'PARTIAL')
      ORDER BY i.due_date ASC LIMIT 10
    `).all();

    return NextResponse.json({
      stats: { totalLearners, activeCourses, completedCourses, unallocated, pendingInvoices, outstanding, totalReceived },
      recentRegistrations,
      pendingInvoices: pendingInvoiceList,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
