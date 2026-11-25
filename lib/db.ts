import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
const isVercel = process.env.VERCEL === '1';
const dbDir = isVercel ? '/tmp' : path.join(process.cwd(), 'data');
const dbPath = path.join(dbDir, 'portal.db');
if (!isVercel && !fs.existsSync(dbDir)) { fs.mkdirSync(dbDir, { recursive: true }); }
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'staff', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS employers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, contact_name TEXT, contact_email TEXT, contact_phone TEXT, address TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS learners (id INTEGER PRIMARY KEY AUTOINCREMENT, first_name TEXT NOT NULL, last_name TEXT NOT NULL, email TEXT UNIQUE, phone TEXT, date_of_birth TEXT, employer_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (employer_id) REFERENCES employers(id));
  CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, duration_days INTEGER, price REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP);
  CREATE TABLE IF NOT EXISTS registrations (id INTEGER PRIMARY KEY AUTOINCREMENT, learner_id INTEGER NOT NULL, course_id INTEGER NOT NULL, start_date TEXT, end_date TEXT, status TEXT DEFAULT 'pending', notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (learner_id) REFERENCES learners(id), FOREIGN KEY (course_id) REFERENCES courses(id));
  CREATE TABLE IF NOT EXISTS invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, employer_id INTEGER, learner_id INTEGER, registration_id INTEGER, amount REAL NOT NULL, status TEXT DEFAULT 'unpaid', due_date TEXT, paid_date TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (employer_id) REFERENCES employers(id), FOREIGN KEY (learner_id) REFERENCES learners(id), FOREIGN KEY (registration_id) REFERENCES registrations(id));
`);
try {
  const row = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (row.count === 0) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const bcrypt = require('bcryptjs');
    const h = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 10);
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(process.env.ADMIN_EMAIL || 'admin@magic-training.co.uk', h, process.env.ADMIN_NAME || 'Admin User', 'admin');
  }
} catch (e) { console.error('seed err:', e); }
export default db; export { db }; export function getDb() { return db; }
