import { db } from './db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function seed() {
  // Check if already seeded
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@magic-training.co.uk';
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (existing) return;

  // Admin user - credentials from env vars
  const adminId = randomUUID();
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const hashedPw = bcrypt.hashSync(adminPassword, 10);
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  db.prepare('INSERT INTO users (id, email, name, password, role) VALUES (?, ?, ?, ?, ?)').run(
    adminId, adminEmail, adminName, hashedPw, 'ADMIN'
  );

  // Staff
  const staffData = [
    { name: 'George Vilcan', role: 'TRAINER' },
    { name: 'Vlad Muresan', role: 'TRAINER' },
    { name: 'Bogdan Onofrei', role: 'TRAINER' },
    { name: 'Ionut Cirdei', role: 'ASSESSOR' },
    { name: 'Robert Beke', role: 'IQA' },
    { name: 'Bogdan Rata', role: 'TRAINER' },
    { name: 'Daniel Stefura', role: 'TRAINER' },
    { name: 'Ana Rascovschi', role: 'ADMIN' },
  ];
  for (const s of staffData) {
    db.prepare('INSERT INTO staff (id, name, role) VALUES (?, ?, ?)').run(randomUUID(), s.name, s.role);
  }

  // Courses
  const courses = [
    { name: 'ICATS Training', category: 'Health & Safety', duration: '4 days', price: 800 },
    { name: 'IOSH Working Safely', category: 'Health & Safety', duration: '1 day', price: 200 },
    { name: 'IPAF Mobile Vertical (3A) & Mobile Boom (3B)', category: 'Health & Safety', duration: '', price: 250 },
    { name: 'Level 2 NVQ - On Site Assessment', category: 'NVQ Level 2', duration: '', price: 700 },
    { name: 'Level 2 NVQ Diploma in Plastering', category: 'NVQ Level 2', duration: '', price: 700 },
    { name: 'NVQ Level 3 OSAT - On Site Assessment', category: 'NVQ Level 3', duration: '10 weeks', price: 1000 },
    { name: 'Level 4 NVQ Diploma in Construction Site Supervision', category: 'NVQ Level 4', duration: '10-12 weeks', price: 1400 },
    { name: 'Level 6 NVQ Diploma in Construction Site Management', category: 'NVQ Level 6', duration: '12-14 weeks', price: 1600 },
    { name: 'Level 7 NVQ Diploma in Construction Senior Management', category: 'NVQ Level 7', duration: '14-16 weeks', price: 1800 },
    { name: 'Level 3 First Aid at Work Awareness', category: 'Short Courses', duration: '2 days', price: 250 },
    { name: 'Emergency First Aid Awareness', category: 'Short Courses', duration: '3 hours', price: 70 },
    { name: 'Traffic Marshall Awareness', category: 'Short Courses', duration: '3 hours', price: 70 },
    { name: 'IET Wiring Regulations 18th Edition', category: 'Electrical', duration: '1 day', price: 450 },
  ];
  for (const course of courses) {
    db.prepare('INSERT INTO courses (id, name, category, duration, price, price_vat) VALUES (?, ?, ?, ?, ?, ?)').run(
      randomUUID(), course.name, course.category, course.duration, course.price, 1
    );
  }
  console.log('Database seeded');
}
