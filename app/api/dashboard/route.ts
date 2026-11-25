import { NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET() {
  await ensureDb();
  const [learners, staff, employers, courses, registrations, activeRegs, invoices, pendingInv, payments] = await Promise.all([
    client.execute('SELECT COUNT(*) FROM learners'),
    client.execute('SELECT COUNT(*) FROM staff WHERE is_active = 1'),
    client.execute('SELECT COUNT(*) FROM employers'),
    client.execute('SELECT COUNT(*) FROM courses WHERE is_active = 1'),
    client.execute('SELECT COUNT(*) FROM registrations'),
    client.execute("SELECT COUNT(*) FROM registrations WHERE course_status = 'ACTIVE'"),
    client.execute('SELECT COALESCE(SUM(total), 0) FROM invoices'),
    client.execute("SELECT COALESCE(SUM(total), 0) FROM invoices WHERE status = 'PENDING'"),
    client.execute('SELECT COALESCE(SUM(amount), 0) FROM payments'),
  ]);
  return NextResponse.json({
    totalLearners: learners.rows[0][0],
    totalStaff: staff.rows[0][0],
    totalEmployers: employers.rows[0][0],
    totalCourses: courses.rows[0][0],
    totalRegistrations: registrations.rows[0][0],
    activeRegistrations: activeRegs.rows[0][0],
    totalInvoiced: invoices.rows[0][0],
    pendingInvoices: pendingInv.rows[0][0],
    totalPayments: payments.rows[0][0],
  });
}
