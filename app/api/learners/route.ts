import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  const where = search ? `WHERE l.first_name LIKE ? OR l.last_name LIKE ? OR l.email LIKE ? OR l.phone LIKE ?` : '';
  const params = search ? [`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`] : [];

  const learners = db.prepare(`
    SELECT l.*, e.name as employer_name,
           COUNT(r.id) as registration_count
    FROM learners l
    LEFT JOIN employers e ON l.employer_id = e.id
    LEFT JOIN registrations r ON r.learner_id = l.id
    ${where}
    GROUP BY l.id
    ORDER BY l.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, limit, offset);

  const total = (db.prepare(`SELECT COUNT(*) as c FROM learners l ${where}`).get(...params) as any).c;

  return NextResponse.json({ learners, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = randomUUID();

  db.prepare(`
    INSERT INTO learners (id, first_name, last_name, email, phone, address, date_of_birth, employer_id, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.firstName, body.lastName, body.email || null, body.phone || null,
         body.address || null, body.dateOfBirth || null, body.employerId || null, body.notes || null);

  const learner = db.prepare('SELECT * FROM learners WHERE id = ?').get(id);
  return NextResponse.json(learner, { status: 201 });
}
