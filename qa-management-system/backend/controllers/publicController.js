const db = require('../config/db');

exports.latest = async (req, res) => {
  const report = await db.get(`
    SELECT r.*, rel.version, p.name AS project_name
    FROM reports r
    JOIN releases rel ON rel.id = r.release_id
    JOIN projects p ON p.id = rel.project_id
    WHERE r.published = 1
    ORDER BY r.created_at DESC
    LIMIT 1
  `);
  if (!report) return res.json(null);
  res.json({ ...report, summary: JSON.parse(report.summary_json) });
};

exports.history = async (req, res) => {
  const reports = await db.query(`
    SELECT r.id, r.created_at, rel.version, p.name AS project_name, r.summary_json
    FROM reports r
    JOIN releases rel ON rel.id = r.release_id
    JOIN projects p ON p.id = rel.project_id
    WHERE r.published = 1
    ORDER BY r.created_at DESC
    LIMIT 20
  `);
  res.json(reports.map(r => {
    const s = JSON.parse(r.summary_json);
    const executed = s.pass + s.fail;
    return {
      id: r.id,
      created_at: r.created_at,
      version: r.version,
      project_name: r.project_name,
      passRate: executed ? Math.round((s.pass / executed) * 100) : 0,
    };
  }));
};

exports.byId = async (req, res) => {
  const report = await db.get(`
    SELECT r.*, rel.version, p.name AS project_name
    FROM reports r
    JOIN releases rel ON rel.id = r.release_id
    JOIN projects p ON p.id = rel.project_id
    WHERE r.id = ? AND r.published = 1
  `, [req.params.id]);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json({ ...report, summary: JSON.parse(report.summary_json) });
};
