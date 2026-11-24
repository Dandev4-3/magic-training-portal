import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const allocation = searchParams.get('allocation') || '';
  const search = searchParams.get('search') || '';

  let where = 'WHERE 1=1';
  const params: any[] = [];
  if (status) { where += ' AND r.course_status = ?'; params.push(status); }
  if (allocation) { where += ' AND r.allocation_status = ?'; params.push(allocation); }
  if (search) {
    where += ' AND (l.first_name LIKE ? OR l.last_name LIKE ? OR c.name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const registrations = db.prepare(`
    SELECT r.*,
           l.first_name || ' ' || l.last_name as learner_name,
           l.phone as learner_phone,
           c.name as course_name, c.price as course_price, c.category as course_category,
           s.name as staff_name,
           e.name as employer_name
    FROM registrations r
    JOIN learners l ON r.learner_id = l.id
    JOIN courses c ON r.course_id = c.id
    LEFT JOIN staff s ON r.staff_id = s.id
    LEFT JOIN employers e ON r.employer_id = e.id
    ${where}
    ORDER BY r.created_at DESC
    LIMIT 100
  `).all(...params);

  return NextResponse.json(registrations);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = randomUUID();
  db.prepare(`
    INSERT INTO registrations (id, learner_id, course_id, employer_id, staff_id, start_date, planned_end_date, notes, allocation_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.learnerId, body.courseId, body.employerId || null, body.staffId || null,
         body.startDate || null, body.plannedEndDate || null, body.notes || null,
         body.staffId ? 'ALLOCATED' : 'NOT_ALLOCATED');
  return NextResponse.json({ id }, { status: 201 });
}
