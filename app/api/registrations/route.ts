import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';
import { randomUUID } from 'crypto';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function GET() {
  await ensureDb();
  const res = await client.execute(`
    SELECT r.*, l.first_name, l.last_name, c.name as course_name, e.name as employer_name
    FROM registrations r
    LEFT JOIN learners l ON r.learner_id = l.id
    LEFT JOIN courses c ON r.course_id = c.id
    LEFT JOIN employers e ON r.employer_id = e.id
    ORDER BY r.created_at DESC
  `);
  const registrations = res.rows.map(r => ({
    id: r[0], learner_id: r[1], course_id: r[2], employer_id: r[3], staff_id: r[4],
    start_date: r[5], planned_end_date: r[6], registration_date: r[7],
    course_status: r[8], allocation_status: r[9], notes: r[10], created_at: r[11],
    first_name: r[12], last_name: r[13], course_name: r[14], employer_name: r[15],
  }));
  return NextResponse.json(registrations);
}

export async function POST(req: NextRequest) {
  await ensureDb();
  const body = await req.json();
  const id = randomUUID();
  await client.execute({
    sql: `INSERT INTO registrations (id, learner_id, course_id, employer_id, staff_id, start_date, planned_end_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [id, body.learnerId, body.courseId, body.employerId || null, body.staffId || null,
           body.startDate || null, body.plannedEndDate || null, body.notes || null],
  });
  const r = await client.execute({ sql: 'SELECT * FROM registrations WHERE id = ?', args: [id] });
  const row = r.rows[0];
  return NextResponse.json({ id: row[0], learner_id: row[1], course_id: row[2] }, { status: 201 });
}
