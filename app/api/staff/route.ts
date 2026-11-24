import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  const staff = db.prepare('SELECT * FROM staff WHERE is_active = 1 ORDER BY name').all();
  return NextResponse.json(staff);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = randomUUID();
  db.prepare('INSERT INTO staff (id, name, email, phone, role) VALUES (?, ?, ?, ?, ?)').run(
    id, body.name, body.email || null, body.phone || null, body.role
  );
  return NextResponse.json(db.prepare('SELECT * FROM staff WHERE id = ?').get(id), { status: 201 });
}
