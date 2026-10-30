const db = require('../config/db');

exports.summary = async (req, res) => {
  const totalProjects = (await db.get('SELECT COUNT(*) c FROM projects WHERE archived = 0')).c;
  const totalTasks = (await db.get('SELECT COUNT(*) c FROM tasks')).c;

  const statusCounts = await db.query(`
    SELECT COALESCE(te.status, 'not_executed') AS status, COUNT(*) c
    FROM test_cases tc
    LEFT JOIN test_execution te ON te.test_case_id = tc.id
    GROUP BY status
  `);
  const counts = { pass: 0, fail: 0, blocked: 0, not_executed: 0 };
  statusCounts.forEach(r => { counts[r.status] = r.c; });

  const releaseStatus = await db.query(`
    SELECT status, COUNT(*) c FROM releases GROUP BY status
  `);

  const recentActivity = await db.query(`
    SELECT te.executed_at, te.status, tc.scenario, u.name AS executed_by
    FROM test_execution te
    JOIN test_cases tc ON tc.id = te.test_case_id
    LEFT JOIN users u ON u.id = te.executed_by
    WHERE te.executed_at IS NOT NULL
    ORDER BY te.executed_at DESC
    LIMIT 10
  `);

  res.json({
    totalProjects,
    totalTasks,
    testSummary: { pass: counts.pass, fail: counts.fail, pending: counts.blocked + counts.not_executed },
    releaseStatus,
    recentActivity,
  });
};
