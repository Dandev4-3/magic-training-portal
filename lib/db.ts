import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'magic.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'STAFF',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS learners (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    date_of_birth TEXT,
    employer_id TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (employer_id) REFERENCES employers(id)
  );

  CREATE TABLE IF NOT EXISTS employers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    duration TEXT,
    price REAL NOT NULL,
    price_vat INTEGER DEFAULT 1,
    description TEXT,
    venue TEXT,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id TEXT PRIMARY KEY,
    learner_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    employer_id TEXT,
    staff_id TEXT,
    registration_date TEXT DEFAULT (datetime('now')),
    start_date TEXT,
    planned_end_date TEXT,
    completion_date TEXT,
    allocation_status TEXT DEFAULT 'NOT_ALLOCATED',
    course_status TEXT DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (learner_id) REFERENCES learners(id),
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (employer_id) REFERENCES employers(id),
    FOREIGN KEY (staff_id) REFERENCES staff(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    invoice_no TEXT UNIQUE NOT NULL,
    learner_id TEXT,
    employer_id TEXT,
    created_by_id TEXT NOT NULL,
    issue_date TEXT DEFAULT (datetime('now')),
    due_date TEXT NOT NULL,
    subtotal REAL NOT NULL,
    vat_amount REAL NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'PENDING',
    notes TEXT,
    stripe_payment_intent_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (learner_id) REFERENCES learners(id),
    FOREIGN KEY (employer_id) REFERENCES employers(id),
    FOREIGN KEY (created_by_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    registration_id TEXT,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    vat_rate REAL DEFAULT 20,
    total REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (registration_id) REFERENCES registrations(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    invoice_id TEXT NOT NULL,
    recorded_by_id TEXT NOT NULL,
    amount REAL NOT NULL,
    method TEXT NOT NULL,
    reference TEXT,
    ledger TEXT DEFAULT 'BANK',
    payment_date TEXT DEFAULT (datetime('now')),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (invoice_id) REFERENCES invoices(id),
    FOREIGN KEY (recorded_by_id) REFERENCES users(id)
  );
`);

export default db;
export { db };
export function getDb() { return db; }
