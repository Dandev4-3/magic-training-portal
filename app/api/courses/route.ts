import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  const courses = db.prepare('SELECT * FROM courses ORDER BY category, name').all();
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const id = randomUUID();
  db.prepare(`
    INSERT INTO courses (id, name, category, duration, price, price_vat, description, venue)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, body.name, body.category, body.duration || '', body.price, body.priceVat ? 1 : 0,
         body.description || null, body.venue || null);
  return NextResponse.json(db.prepare('SELECT * FROM courses WHERE id = ?').get(id), { status: 201 });
}
