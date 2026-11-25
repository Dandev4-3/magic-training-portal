import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const TURSO_URL = process.env.TURSO_DATABASE_URL || 'libsql://magic-training-portal-rubdev.aws-eu-central-1.turso.io';
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || '';

export const client = createClient({
  url: TURSO_URL,
  authToken: TURSO_TOKEN,
});

export async function initDb() {
  await client.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'staff',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT, phone TEXT,
    role TEXT NOT NULL DEFAULT 'trainer', is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS employers (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, contact TEXT, email TEXT, phone TEXT,
    address TEXT, contact_name TEXT, notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS learners (
    id TEXT PRIMARY KEY, first_name TEXT NOT NULL, last_name TEXT NOT NULL,
    email TEXT, phone TEXT, address TEXT, date_of_birth TEXT,
    employer_id TEXT REFERENCES employers(id), notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT, duration TEXT,
    price REAL, price_vat INTEGER DEFAULT 0, description TEXT, venue TEXT,
    is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY, learner_id TEXT REFERENCES learners(id),
    course_id TEXT REFERENCES courses(id), employer_id TEXT REFERENCES employers(id),
    staff_id TEXT REFERENCES staff(id), start_date TEXT, planned_end_date TEXT,
    registration_date TEXT DEFAULT CURRENT_TIMESTAMP, course_status TEXT DEFAULT 'ACTIVE',
    allocation_status TEXT DEFAULT 'NOT_ALLOCATED', notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY, invoice_no TEXT UNIQUE, learner_id TEXT REFERENCES learners(id),
    employer_id TEXT REFERENCES employers(id), created_by_id TEXT, due_date TEXT,
    subtotal REAL DEFAULT 0, vat_amount REAL DEFAULT 0, total REAL DEFAULT 0,
    status TEXT DEFAULT 'PENDING', notes TEXT, issued_date TEXT DEFAULT CURRENT_TIMESTAMP,
    paid_date TEXT, stripe_payment_intent_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY, invoice_id TEXT REFERENCES invoices(id),
    registration_id TEXT REFERENCES registrations(id), description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1, unit_price REAL DEFAULT 0, vat_rate REAL DEFAULT 20,
    total REAL DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  await client.execute(`CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY, invoice_id TEXT REFERENCES invoices(id), recorded_by_id TEXT,
    amount REAL NOT NULL, method TEXT, reference TEXT, ledger TEXT DEFAULT 'BANK',
    payment_date TEXT DEFAULT CURRENT_TIMESTAMP, notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  const result = await client.execute('SELECT COUNT(*) as count FROM users');
  const count = result.rows[0][0];
  if (count === 0) {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@magic-training.co.uk';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const adminName = process.env.ADMIN_NAME || 'Admin User';
    const hash = bcrypt.hashSync(adminPassword, 10);
    await client.execute({ sql: 'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)', args: [adminEmail, hash, adminName, 'admin'] });
  }
}

export function rowToObj(columns: string[], row: any[]): Record<string, any> { const obj: Record<string, any> = {}; columns.forEach((col, i) => { obj[col] = row[i]; }); return obj; }
export function rowsToObjs(columns: string[], rows: any[][]): Record<string, any>[] { return rows.map(row => rowToObj(columns, row)); }
export default client;
