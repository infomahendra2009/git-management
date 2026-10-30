const db = require('../config/db');

exports.list = async (req, res) => {
  const { search, archived } = req.query;
  let sql = 'SELECT * FROM projects WHERE 1=1';
  const params = [];
  if (search) { sql += ' AND name LIKE ?'; params.push(`%${search}%`); }
  if (archived !== undefined) { sql += ' AND archived = ?'; params.push(archived === 'true' ? 1 : 0); }
  sql += ' ORDER BY created_at DESC';
  res.json(await db.query(sql, params));
};

exports.get = async (req, res) => {
  const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const releases = await db.query('SELECT * FROM releases WHERE project_id = ? ORDER BY created_at DESC', [project.id]);
  const tasks = await db.query('SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC', [project.id]);
  res.json({ ...project, releases, tasks });
};

exports.create = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Project name is required' });
  const info = await db.run('INSERT INTO projects (name, description, created_by) VALUES (?, ?, ?)', [name, description || '', req.user.id]);
  res.status(201).json(await db.get('SELECT * FROM projects WHERE id = ?', [info.insertId]));
};

exports.update = async (req, res) => {
  const { name, description } = req.body;
  const project = await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  await db.run('UPDATE projects SET name = ?, description = ? WHERE id = ?',
    [name ?? project.name, description ?? project.description, project.id]);
  res.json(await db.get('SELECT * FROM projects WHERE id = ?', [project.id]));
};

exports.archive = async (req, res) => {
  const { archived } = req.body;
  await db.run('UPDATE projects SET archived = ? WHERE id = ?', [archived ? 1 : 0, req.params.id]);
  res.json(await db.get('SELECT * FROM projects WHERE id = ?', [req.params.id]));
};

exports.remove = async (req, res) => {
  await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
};
