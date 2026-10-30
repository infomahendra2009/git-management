const db = require('../config/db');

exports.list = async (req, res) => {
  const { project_id } = req.query;
  let sql = 'SELECT * FROM releases WHERE 1=1';
  const params = [];
  if (project_id) { sql += ' AND project_id = ?'; params.push(project_id); }
  sql += ' ORDER BY created_at DESC';
  res.json(await db.query(sql, params));
};

exports.get = async (req, res) => {
  const release = await db.get('SELECT * FROM releases WHERE id = ?', [req.params.id]);
  if (!release) return res.status(404).json({ error: 'Release not found' });
  const tasks = await db.query('SELECT * FROM tasks WHERE release_id = ? ORDER BY created_at DESC', [release.id]);
  res.json({ ...release, tasks });
};

exports.create = async (req, res) => {
  const { project_id, version } = req.body;
  if (!project_id || !version) return res.status(400).json({ error: 'project_id and version are required' });
  const info = await db.run('INSERT INTO releases (project_id, version) VALUES (?, ?)', [project_id, version]);
  res.status(201).json(await db.get('SELECT * FROM releases WHERE id = ?', [info.insertId]));
};

exports.update = async (req, res) => {
  const { version } = req.body;
  const release = await db.get('SELECT * FROM releases WHERE id = ?', [req.params.id]);
  if (!release) return res.status(404).json({ error: 'Release not found' });
  await db.run('UPDATE releases SET version = ? WHERE id = ?', [version ?? release.version, release.id]);
  res.json(await db.get('SELECT * FROM releases WHERE id = ?', [release.id]));
};

exports.publish = async (req, res) => {
  await db.run("UPDATE releases SET status = 'published', published_at = NOW() WHERE id = ?", [req.params.id]);
  res.json(await db.get('SELECT * FROM releases WHERE id = ?', [req.params.id]));
};

exports.close = async (req, res) => {
  await db.run("UPDATE releases SET status = 'closed', closed_at = NOW() WHERE id = ?", [req.params.id]);
  res.json(await db.get('SELECT * FROM releases WHERE id = ?', [req.params.id]));
};

exports.remove = async (req, res) => {
  const release = await db.get('SELECT * FROM releases WHERE id = ?', [req.params.id]);
  if (!release) return res.status(404).json({ error: 'Release not found' });
  // Tasks reference releases with ON DELETE SET NULL, so tasks survive and just become unassigned.
  await db.run('DELETE FROM releases WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
};
