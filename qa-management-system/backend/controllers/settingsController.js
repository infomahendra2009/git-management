const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.listUsers = async (req, res) => {
  res.json(await db.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'));
};

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'name, email, and password are required' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = await db.run('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role === 'admin' ? 'admin' : 'qa']);
    res.status(201).json(await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [info.insertId]));
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'A user with that email already exists' });
    throw e;
  }
};

exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  await db.run('UPDATE users SET role = ? WHERE id = ?', [role === 'admin' ? 'admin' : 'qa', req.params.id]);
  res.json(await db.get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.params.id]));
};

exports.removeUser = async (req, res) => {
  await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
};

exports.getAppSettings = async (req, res) => {
  const rows = await db.query('SELECT setting_key, value FROM settings');
  const obj = {};
  rows.forEach(r => { obj[r.setting_key] = r.value; });
  res.json(obj);
};

exports.updateAppSettings = async (req, res) => {
  const entries = Object.entries(req.body || {});
  await db.transaction(async (tx) => {
    for (const [k, v] of entries) {
      await tx.run(`
        INSERT INTO settings (setting_key, value) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE value = VALUES(value)
      `, [k, String(v)]);
    }
  });
  res.json({ ok: true });
};
