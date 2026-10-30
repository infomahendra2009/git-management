const db = require('../config/db');

async function buildSummary(releaseId) {
  const cases = await db.query(`
    SELECT tc.id, tc.severity, te.status
    FROM test_cases tc
    JOIN tasks t ON t.id = tc.task_id
    LEFT JOIN test_execution te ON te.test_case_id = tc.id
    WHERE t.release_id = ?
  `, [releaseId]);

  const bySeverity = { critical: { total:0,pass:0,fail:0,pending:0 }, high: { total:0,pass:0,fail:0,pending:0 },
                        medium: { total:0,pass:0,fail:0,pending:0 }, low: { total:0,pass:0,fail:0,pending:0 } };
  let pass = 0, fail = 0, pending = 0;

  cases.forEach(c => {
    const sev = bySeverity[c.severity] || bySeverity.medium;
    sev.total++;
    const status = c.status || 'not_executed';
    if (status === 'pass') { pass++; sev.pass++; }
    else if (status === 'fail') { fail++; sev.fail++; }
    else { pending++; sev.pending++; }
  });

  return { total: cases.length, pass, fail, pending, bySeverity };
}

exports.releaseReport = async (req, res) => {
  const release = await db.get('SELECT * FROM releases WHERE id = ?', [req.params.releaseId]);
  if (!release) return res.status(404).json({ error: 'Release not found' });
  res.json({ release, summary: await buildSummary(release.id) });
};

exports.releaseReportCSV = async (req, res) => {
  const cases = await db.query(`
    SELECT tc.code, tc.severity, tc.feature, tc.scenario, tc.expected_result, te.status, te.comments
    FROM test_cases tc
    JOIN tasks t ON t.id = tc.task_id
    LEFT JOIN test_execution te ON te.test_case_id = tc.id
    WHERE t.release_id = ?
    ORDER BY tc.id ASC
  `, [req.params.releaseId]);

  const rows = [['ID','Severity','Feature','Scenario','Expected Result','Status','Comments']];
  cases.forEach(c => rows.push([c.code || '', c.severity, c.feature, c.scenario, c.expected_result, c.status || 'not_executed', c.comments || '']));
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="release-${req.params.releaseId}-report.csv"`);
  res.send(csv);
};

exports.publish = async (req, res) => {
  const release = await db.get('SELECT * FROM releases WHERE id = ?', [req.params.releaseId]);
  if (!release) return res.status(404).json({ error: 'Release not found' });
  const summary = await buildSummary(release.id);
  const info = await db.run(`
    INSERT INTO reports (release_id, type, summary_json, published)
    VALUES (?, 'release', ?, 1)
  `, [release.id, JSON.stringify(summary)]);
  await db.run("UPDATE releases SET status = 'published', published_at = NOW() WHERE id = ?", [release.id]);
  res.status(201).json(await db.get('SELECT * FROM reports WHERE id = ?', [info.insertId]));
};

exports.list = async (req, res) => {
  const { release_id } = req.query;
  let sql = 'SELECT * FROM reports WHERE 1=1';
  const params = [];
  if (release_id) { sql += ' AND release_id = ?'; params.push(release_id); }
  sql += ' ORDER BY created_at DESC';
  res.json(await db.query(sql, params));
};
