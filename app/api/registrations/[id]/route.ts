import { NextRequest, NextResponse } from 'next/server';
import { client, initDb } from '@/lib/db';

let initialized = false;
async function ensureDb() { if (!initialized) { await initDb(); initialized = true; } }

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  const body = await req.json();
  await client.execute({
    sql: `UPDATE registrations SET course_status=?, allocation_status=?, staff_id=?, start_date=?, planned_end_date=?, notes=? WHERE id=?`,
    args: [body.courseStatus || 'ACTIVE', body.allocationStatus || 'NOT_ALLOCATED',
           body.staffId || null, body.startDate || null, body.plannedEndDate || null,
           body.notes || null, params.id],
  });
  const r = await client.execute({ sql: 'SELECT * FROM registrations WHERE id = ?', args: [params.id] });
  const row = r.rows[0];
  return NextResponse.json({
    id: row[0], learner_id: row[1], course_id: row[2], employer_id: row[3],
    course_status: row[8], allocation_status: row[9],
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await ensureDb();
  await client.execute({ sql: 'DELETE FROM registrations WHERE id = ?', args: [params.id] });
  return NextResponse.json({ success: true });
}
