import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const url = process.env.TURSO_DATABASE_URL || 'NOT_SET';
    const token = process.env.TURSO_AUTH_TOKEN ? 'SET' : 'NOT_SET';
    const nextSecret = process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET';
    const nextUrl = process.env.NEXTAUTH_URL || 'NOT_SET';
    
    const client = createClient({ url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN });
    
    // Try to query users
    let userCount = 0;
    let userEmail = '';
    let tableExists = false;
    try {
      const r = await client.execute('SELECT COUNT(*) as count FROM users');
      userCount = r.rows[0][0] as number;
      tableExists = true;
      if (userCount > 0) {
        const u = await client.execute('SELECT email FROM users LIMIT 1');
        userEmail = u.rows[0][0] as string;
      }
    } catch(e: any) {
      tableExists = false;
    }
    
    return NextResponse.json({
      env: { url: url.substring(0, 30) + '...', token, nextSecret, nextUrl },
      db: { tableExists, userCount, userEmail }
    });
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
