import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  const employers = db.prepare('SELECT * FROM employers ORDER BY name').all();
  return NextResponse.json(employers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = randomUUID();
  db.prepare('INSERT INTO employers (id, name, contact, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, body.name, body.contact || null, body.email || null, body.phone || null, body.address || null
  );
  return NextResponse.json(db.prepare('SELECT * FROM employers WHERE id = ?').get(id), { status: 201 });
}
