import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const allocationStatus = body.staffId ? 'ALLOCATED' : 'NOT_ALLOCATED';
  db.prepare(`
    UPDATE registrations SET staff_id=?, allocation_status=?, course_status=?,
      start_date=?, planned_end_date=?, completion_date=?, notes=?
    WHERE id=?
  `).run(body.staffId || null, allocationStatus, body.courseStatus || 'ACTIVE',
         body.startDate || null, body.plannedEndDate || null, body.completionDate || null,
         body.notes || null, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('DELETE FROM registrations WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
