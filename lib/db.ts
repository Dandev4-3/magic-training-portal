import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://magic-training-portal-rubdev.aws-eu-central-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

export async function initDb() {
  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'staff',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS employers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact_name TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      address TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS learners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      employer_id INTEGER REFERENCES employers(id),
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      duration_hours REAL,
      price REAL,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_id INTEGER REFERENCES learners(id),
      course_id INTEGER REFERENCES courses(id),
      employer_id INTEGER REFERENCES employers(id),
      scheduled_date TEXT,
      completed_date TEXT,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      employer_id INTEGER REFERENCES employers(id),
      registration_id INTEGER REFERENCES registrations(id),
      amount REAL,
      status TEXT DEFAULT 'unpaid',
      issued_date TEXT,
      paid_date TEXT,
      stripe_payment_intent_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Auto-seed admin user if none exists
  const result = await client.execute('SELECT COUNT(*) as count FROM users');
  const count = result.rows[0][0] as number;
  if (count === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@magic-training.co.uk';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const hash = bcrypt.hashSync(adminPassword, 10);
    await client.execute({
      sql: 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      args: [adminEmail, hash, adminName, 'admin'],
    });
    console.log('Admin user seeded:', adminEmail);
  }
}

export { client };
export default client;
