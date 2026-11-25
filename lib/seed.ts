import { client } from './db';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function seed() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@magic-training.co.uk';
  const r = await client.execute({ sql: 'SELECT id FROM users WHERE email = ?', args: [adminEmail] });
  if (r.rows.length > 0) return;

  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const hashedPw = bcrypt.hashSync(adminPassword, 10);
  const adminName = process.env.ADMIN_NAME || 'Admin User';
  await client.execute({
    sql: 'INSERT INTO users (email, name, password, role) VALUES (?, ?, ?, ?)',
    args: [adminEmail, adminName, hashedPw, 'admin'],
  });

  const staffData = [
    { name: 'George Vilcan', role: 'trainer' },
    { name: 'Vlad Muresan', role: 'trainer' },
    { name: 'Bogdan Onofrei', role: 'trainer' },
    { name: 'Ionut Cirdei', role: 'assessor' },
    { name: 'Robert Beke', role: 'iqa' },
    { name: 'Bogdan Rata', role: 'trainer' },
    { name: 'Daniel Stefura', role: 'trainer' },
    { name: 'Ana Rascovschi', role: 'admin' },
  ];
  for (const s of staffData) {
    await client.execute({ sql: 'INSERT INTO staff (id, name, role) VALUES (?, ?, ?)', args: [randomUUID(), s.name, s.role] });
  }

  const courses = [
    { name: 'ICATS Training', category: 'Health & Safety', duration: '4 days', price: 800 },
    { name: 'IOSH Working Safely', category: 'Health & Safety', duration: '1 day', price: 200 },
    { name: 'IPAF Mobile Vertical (3A) & Mobile Boom (3B)', category: 'Health & Safety', duration: '', price: 250 },
    { name: 'Level 1 Award in Health and Safety', category: 'Health & Safety', duration: '', price: 250 },
    { name: 'Level 2 NVQ - On Site Assessment', category: 'NVQ Level 2', duration: '', price: 700 },
    { name: 'Level 2 NVQ Diploma in Interior Systems (Drylining Fixing/Finish)', category: 'NVQ Level 2', duration: '', price: 700 },
    { name: 'Level 2 NVQ Diploma in Insulation and Building Treatments', category: 'NVQ Level 2', duration: '', price: 700 },
    { name: 'NVQ Level 3 OSAT - On Site Assessment', category: 'NVQ Level 3', duration: '10 weeks', price: 1000 },
    { name: 'Level 4 NVQ Diploma in Construction Site Supervision', category: 'NVQ Level 4', duration: '10-12 weeks', price: 1400 },
    { name: 'Level 6 NVQ Diploma in Construction Site Management', category: 'NVQ Level 6', duration: '12-14 weeks', price: 1600 },
    { name: 'Level 3 First Aid at Work Awareness', category: 'Short Courses', duration: '2 days', price: 250 },
    { name: 'Emergency First Aid Awareness', category: 'Short Courses', duration: '3 hours', price: 70 },
    { name: 'Manual Handling Awareness', category: 'Short Courses', duration: '3 hours', price: 70 },
    { name: 'IET Wiring Regulations 18th Edition', category: 'Electrical', duration: '1 day', price: 450 },
    { name: 'ECS Labourer Card (Electrician)', category: 'Cards', duration: '1 day', price: 600 },
  ];

  for (const c of courses) {
    await client.execute({ sql: 'INSERT INTO courses (id, name, category, duration, price, price_vat) VALUES (?, ?, ?, ?, ?, ?)', args: [randomUUID(), c.name, c.category, c.duration, c.price, 1] });
  }
  console.log('Database seeded with Magic Training data');
}
