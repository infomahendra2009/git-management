// Seeds an admin + QA user and a sample "Host Management" project/release/task
// with the 29 test cases from the original sign-off checklist.
// Run with `--if-empty` to skip seeding if users already exist (used by the Docker entrypoint).
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./config/db');

const ifEmpty = process.argv.includes('--if-empty');

const hostManagementCases = [
  {code:'HM-001', sev:'critical', feature:'Page Load', scenario:'Open Host Management page', expected:'Page loads successfully without errors'},
  {code:'HM-002', sev:'critical', feature:'Login Access', scenario:'Access page after login', expected:'Authorized users can access the page'},
  {code:'HM-003', sev:'critical', feature:'Host List', scenario:'Verify host data', expected:'Correct host records are displayed'},
  {code:'HM-004', sev:'critical', feature:'Add Host', scenario:'Create a new host', expected:'Host is created successfully'},
  {code:'HM-005', sev:'critical', feature:'Edit Host', scenario:'Update host details', expected:'Changes are saved correctly'},
  {code:'HM-006', sev:'critical', feature:'Delete Host', scenario:'Delete a host', expected:'Host is removed successfully'},
  {code:'HM-007', sev:'critical', feature:'Status Toggle', scenario:'Enable/Disable host', expected:'Status updates successfully in UI and DB'},
  {code:'HM-008', sev:'critical', feature:'API Response', scenario:'Perform CRUD operations', expected:'APIs return correct status and data'},
  {code:'HM-009', sev:'critical', feature:'Database', scenario:'Verify data integrity', expected:'Database reflects all changes correctly'},
  {code:'HM-010', sev:'critical', feature:'Security', scenario:'SQL Injection / XSS', expected:'Application blocks malicious input'},
  {code:'HM-011', sev:'high', feature:'Search', scenario:'Search by Host Name/IP', expected:'Matching records are displayed'},
  {code:'HM-012', sev:'high', feature:'Filters', scenario:'Apply single/multiple filters', expected:'Filtered data is displayed correctly'},
  {code:'HM-013', sev:'high', feature:'Sorting', scenario:'Sort all columns', expected:'Data sorts correctly (ASC/DESC)'},
  {code:'HM-014', sev:'high', feature:'Pagination', scenario:'Next/Previous/Page Size', expected:'Pagination works correctly'},
  {code:'HM-015', sev:'high', feature:'Validation', scenario:'Mandatory fields', expected:'Proper validation messages appear'},
  {code:'HM-016', sev:'high', feature:'Duplicate Validation', scenario:'Add duplicate Host/IP', expected:'Duplicate entries are prevented'},
  {code:'HM-017', sev:'high', feature:'User Permissions', scenario:'Login with different roles', expected:'Permissions are enforced correctly'},
  {code:'HM-018', sev:'high', feature:'Session', scenario:'Session timeout', expected:'User is redirected to login after timeout'},
  {code:'HM-019', sev:'medium', feature:'Breadcrumb', scenario:'Verify navigation', expected:'Correct breadcrumb is displayed'},
  {code:'HM-020', sev:'medium', feature:'Success/Error Messages', scenario:'Perform operations', expected:'Appropriate messages are displayed'},
  {code:'HM-021', sev:'medium', feature:'Loading Indicator', scenario:'Load page/search/filter', expected:'Loading spinner appears appropriately'},
  {code:'HM-022', sev:'medium', feature:'Responsive UI', scenario:'Resize browser', expected:'Layout remains usable'},
  {code:'HM-023', sev:'medium', feature:'Browser Compatibility', scenario:'Chrome/Edge/Firefox', expected:'UI works consistently across browsers'},
  {code:'HM-024', sev:'medium', feature:'Refresh', scenario:'Refresh browser', expected:'Page reloads correctly without data issues'},
  {code:'HM-025', sev:'low', feature:'UI Alignment', scenario:'Verify spacing and alignment', expected:'UI elements are properly aligned'},
  {code:'HM-026', sev:'low', feature:'Font & Icons', scenario:'Verify fonts and icons', expected:'Consistent appearance throughout the page'},
  {code:'HM-027', sev:'low', feature:'Tooltip', scenario:'Hover over icons/buttons', expected:'Tooltips display correctly'},
  {code:'HM-028', sev:'low', feature:'Labels', scenario:'Verify text', expected:'No spelling or grammar issues'},
  {code:'HM-029', sev:'low', feature:'Footer', scenario:'Verify footer information', expected:'Correct company name and copyright'},
];

async function seed() {
  await db.initSchema();

  const userCount = (await db.get('SELECT COUNT(*) c FROM users')).c;
  if (ifEmpty && userCount > 0) {
    console.log('Database already seeded — skipping.');
    process.exit(0);
  }

  await db.transaction(async (tx) => {
    const adminHash = bcrypt.hashSync('Admin123!', 10);
    const qaHash = bcrypt.hashSync('Qa123!', 10);

    const adminId = (await tx.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['Admin User', 'admin@qa.local', adminHash, 'admin']
    )).insertId;
    const qaId = (await tx.run(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['QA Tester', 'qa@qa.local', qaHash, 'qa']
    )).insertId;

    const projectId = (await tx.run(
      'INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)',
      ['Host Management', 'The Host Management feature under test in the internal application.', adminId]
    )).insertId;

    const releaseId = (await tx.run(
      "INSERT INTO releases (project_id, version, status) VALUES (?, ?, 'draft')",
      [projectId, 'v1.0.0']
    )).insertId;

    const taskId = (await tx.run(`
      INSERT INTO tasks (project_id, release_id, title, description, assigned_to, priority, status)
      VALUES (?, ?, ?, ?, ?, 'high', 'in_progress')
    `, [projectId, releaseId, 'QA sign-off — Host Management', 'Full regression pass before release.', qaId])).insertId;

    for (const t of hostManagementCases) {
      const caseId = (await tx.run(`
        INSERT INTO test_cases (task_id, code, feature, scenario, expected_result, severity, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [taskId, t.code, t.feature, t.scenario, t.expected, t.sev, t.sev])).insertId;
      await tx.run(`INSERT INTO test_execution (test_case_id, status) VALUES (?, 'not_executed')`, [caseId]);
    }

    await tx.run('INSERT INTO settings (setting_key, value) VALUES (?, ?)', ['company_name', 'Your Company']);
  });

  console.log('Seed complete.');
  console.log('  Admin login: admin@qa.local / Admin123!');
  console.log('  QA login:    qa@qa.local / Qa123!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
