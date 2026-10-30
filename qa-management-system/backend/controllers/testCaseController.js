const db = require('../config/db');

exports.list = async (req, res) => {
  const { task_id } = req.query;
  let sql = `
    SELECT tc.*, te.status AS exec_status, te.comments AS exec_comments, te.executed_at
    FROM test_cases tc
    LEFT JOIN test_execution te ON te.test_case_id = tc.id
    WHERE 1=1
  `;
  const params = [];
  if (task_id) { sql += ' AND tc.task_id = ?'; params.push(task_id); }
  sql += ' ORDER BY tc.id ASC';
  res.json(await db.query(sql, params));
};

exports.create = async (req, res) => {
  const { task_id, code, feature, scenario, expected_result, severity, priority } = req.body;
  if (!task_id || !scenario) return res.status(400).json({ error: 'task_id and scenario are required' });
  const info = await db.run(`
    INSERT INTO test_cases (task_id, code, feature, scenario, expected_result, severity, priority)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [task_id, code || null, feature || '', scenario, expected_result || '', severity || 'medium', priority || 'medium']);
  await db.run('INSERT INTO test_execution (test_case_id, status) VALUES (?, ?)', [info.insertId, 'not_executed']);
  res.status(201).json(await db.get('SELECT * FROM test_cases WHERE id = ?', [info.insertId]));
};

exports.update = async (req, res) => {
  const tc = await db.get('SELECT * FROM test_cases WHERE id = ?', [req.params.id]);
  if (!tc) return res.status(404).json({ error: 'Test case not found' });
  const u = { ...tc, ...req.body };
  await db.run(`
    UPDATE test_cases SET code=?, feature=?, scenario=?, expected_result=?, severity=?, priority=?
    WHERE id = ?
  `, [u.code, u.feature, u.scenario, u.expected_result, u.severity, u.priority, tc.id]);
  res.json(await db.get('SELECT * FROM test_cases WHERE id = ?', [tc.id]));
};

exports.remove = async (req, res) => {
  await db.run('DELETE FROM test_cases WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
};
