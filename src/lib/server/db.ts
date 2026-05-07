import Database from 'better-sqlite3';
import { join } from 'path';
import { randomUUID } from 'crypto';

const db = new Database('legalwatch.db');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS judgments (
    id TEXT PRIMARY KEY,
    title TEXT,
    case_number TEXT,
    date_of_order TEXT,
    court_name TEXT,
    original_filename TEXT,
    extracted_text TEXT,
    status TEXT DEFAULT 'processing',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    judgment_id TEXT,
    action TEXT,
    department TEXT,
    deadline TEXT,
    deliverable TEXT,
    confidence TEXT,
    reasoning TEXT,
    source_text TEXT,
    page INTEGER,
    urgency TEXT,
    impact TEXT,
    status TEXT DEFAULT 'draft',
    last_note TEXT,
    original_ai_value JSON,
    edit_history JSON,
    verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (judgment_id) REFERENCES judgments(id)
  );
`);

// Migration: Add last_note column if it doesn't exist
try {
  db.prepare('SELECT last_note FROM tasks LIMIT 1').get();
} catch (e) {
  if (e instanceof Error && e.message.includes('no such column')) {
    console.log('Migrating database: Adding last_note column to tasks table');
    db.exec('ALTER TABLE tasks ADD COLUMN last_note TEXT');
  }
}

// Seed initial data if empty
const taskCount = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as any;
if (taskCount.count === 0) {
  console.log('Seeding initial demonstration data...');
  const jId = randomUUID();
  db.prepare('INSERT INTO judgments (id, title, status) VALUES (?, ?, ?)').run(jId, 'Initial Seed Judgment', 'completed');
  
  const seedTasks = [
    {
      id: randomUUID(),
      judgment_id: jId,
      action: 'Assessment of OCI feasibility in Northeast states',
      department: 'Home Affairs',
      deadline: '2026-05-30',
      deliverable: 'Feasibility Report',
      confidence: 'High',
      reasoning: 'Direct mandate from Suhas Chakma vs UOI',
      source_text: 'The States of Arunachal Pradesh, Chhattisgarh... shall undertake an assessment of the feasibility of establishing OCIs',
      urgency: 'Critical',
      impact: 'High',
      status: 'approved'
    },
    {
      id: randomUUID(),
      judgment_id: jId,
      action: 'Protocol development for vacancy filling',
      department: 'Prisons Department',
      deadline: '2026-06-15',
      deliverable: 'Time-bound Protocol',
      confidence: 'High',
      reasoning: 'Requirement for monitoring committee submission',
      source_text: 'Develop a time-bound protocol for filling up existing vacancies in OCIs and open barracks',
      urgency: 'High',
      impact: 'High',
      status: 'approved'
    },
    {
      id: randomUUID(),
      judgment_id: jId,
      action: 'Rationalise eligibility criteria for prisoner transfer',
      department: 'Social Welfare',
      deadline: '2026-07-01',
      deliverable: 'Revised Guidelines',
      confidence: 'Medium',
      reasoning: 'Directive (v) requires revisiting criteria.',
      source_text: 'All States shall revisit and rationalise eligibility criteria for transfer of prisoners',
      urgency: 'Medium',
      impact: 'Medium',
      status: 'approved'
    },
    {
      id: randomUUID(),
      judgment_id: jId,
      action: 'Financial allocation for OCI infrastructure',
      department: 'Finance Department',
      deadline: '2026-08-15',
      deliverable: 'Budget Sanction Order',
      confidence: 'High',
      reasoning: 'Necessary for implementation of para (i) regarding infrastructure.',
      source_text: '...undertake an assessment of the feasibility and necessity for establishing OCIs...',
      urgency: 'High',
      impact: 'High',
      status: 'approved'
    },
    {
      id: randomUUID(),
      judgment_id: jId,
      action: 'IT Infrastructure for Monitoring Committee',
      department: 'Information Technology',
      deadline: '2026-04-15',
      deliverable: 'Monitoring Dashboard',
      confidence: 'Medium',
      reasoning: 'Directive (iv) requires oversight and facilitation.',
      source_text: 'The Monitoring Committee shall be duty-bound to oversee, facilitate and ensure...',
      urgency: 'Medium',
      impact: 'Medium',
      status: 'draft'
    },
    {
      id: randomUUID(),
      judgment_id: jId,
      action: 'Child welfare audit in custodial institutions',
      department: 'Women & Child Development',
      deadline: '2026-05-20',
      deliverable: 'Audit Report',
      confidence: 'High',
      reasoning: 'Protection of vulnerable populations in reformative settings.',
      source_text: 'The state shall ensure protection of children and women in all custodial settings...',
      urgency: 'Critical',
      impact: 'High',
      status: 'approved',
      last_note: 'Forwarded for priority action'
    }
  ];

  const jId2 = randomUUID();
  db.prepare('INSERT INTO judgments (id, title, status) VALUES (?, ?, ?)').run(jId2, 'State vs Health Federation - Public Safety Guidelines', 'completed');

  const additionalTasks = [
    {
      id: randomUUID(),
      judgment_id: jId2,
      action: 'Standardization of sanitation in public offices',
      department: 'Health & Family Welfare',
      deadline: '2026-06-01',
      deliverable: 'Sanitation Manual',
      confidence: 'Medium',
      reasoning: 'Derived from directive on public safety protocols.',
      source_text: 'The Health department must issue standardized guidelines for sanitation...',
      urgency: 'Medium',
      impact: 'Medium',
      status: 'draft'
    },
    {
      id: randomUUID(),
      judgment_id: jId2,
      action: 'Infrastructure upgrade for health safety',
      department: 'Public Works Department (PWD)',
      deadline: '2027-01-01',
      deliverable: 'Renovation Completion Certificate',
      confidence: 'High',
      reasoning: 'Physical modifications required for compliance.',
      source_text: 'Structural changes to ensure ventilation shall be completed...',
      urgency: 'Low',
      impact: 'Medium',
      status: 'approved'
    }
  ];

  for (const t of seedTasks) {
    db.prepare(`
      INSERT INTO tasks (id, judgment_id, action, department, deadline, deliverable, confidence, reasoning, source_text, urgency, impact, status, last_note)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(t.id, t.judgment_id, t.action, t.department, t.deadline, t.deliverable, t.confidence, t.reasoning, t.source_text, t.urgency, t.impact, t.status, (t as any).last_note || null);
  }

  for (const t of additionalTasks) {
    db.prepare(`
      INSERT INTO tasks (id, judgment_id, action, department, deadline, deliverable, confidence, reasoning, source_text, urgency, impact, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(t.id, t.judgment_id, t.action, t.department, t.deadline, t.deliverable, t.confidence, t.reasoning, t.source_text, t.urgency, t.impact, t.status);
  }
}

export default db;
