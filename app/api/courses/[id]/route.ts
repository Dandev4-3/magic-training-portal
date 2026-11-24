import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  db.prepare(`UPDATE courses SET name=?, category=?, duration=?, price=?, price_vat=?, description=?, venue=?, is_active=? WHERE id=?`)
    .run(body.name, body.category, body.duration || '', body.price, body.priceVat ? 1 : 0,
         body.description || null, body.venue || null, body.isActive ? 1 : 0, id);
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  db.prepare('UPDATE courses SET is_active = 0 WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
