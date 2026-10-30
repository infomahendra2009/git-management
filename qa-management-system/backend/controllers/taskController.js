const db = require('../config/db');

exports.list = async (req, res) => {
  const { project_id, release_id } = req.query;
  let sql = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];
  if (project_id) { sql += ' AND project_id = ?'; params.push(project_id); }
  if (release_id) { sql += ' AND release_id = ?'; params.push(release_id); }
  sql += ' ORDER BY created_at DESC';
  res.json(await db.query(sql, params));
};

exports.get = async (req, res) => {
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const testCases = await db.query(`
    SELECT tc.*, te.status AS exec_status, te.comments AS exec_comments, te.executed_at
    FROM test_cases tc
    LEFT JOIN test_execution te ON te.test_case_id = tc.id
    WHERE tc.task_id = ?
    ORDER BY tc.id ASC
  `, [task.id]);
  res.json({ ...task, testCases });
};

exports.create = async (req, res) => {
  const { project_id, release_id, title, description, assigned_to, priority, due_date } = req.body;
  if (!project_id || !title) return res.status(400).json({ error: 'project_id and title are required' });
  const info = await db.run(`
    INSERT INTO tasks (project_id, release_id, title, description, assigned_to, priority, due_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [project_id, release_id || null, title, description || '', assigned_to || null, priority || 'medium', due_date || null]);
  res.status(201).json(await db.get('SELECT * FROM tasks WHERE id = ?', [info.insertId]));
};

exports.update = async (req, res) => {
  const task = await db.get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  const updates = { ...task, ...req.body };
  await db.run(`
    UPDATE tasks SET title=?, description=?, assigned_to=?, priority=?, status=?, due_date=?, release_id=?
    WHERE id = ?
  `, [updates.title, updates.description, updates.assigned_to, updates.priority, updates.status, updates.due_date, updates.release_id, task.id]);
  res.json(await db.get('SELECT * FROM tasks WHERE id = ?', [task.id]));
};

exports.remove = async (req, res) => {
  await db.run('DELETE FROM tasks WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
};
