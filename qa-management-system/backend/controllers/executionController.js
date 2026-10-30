const db = require('../config/db');

exports.setStatus = async (req, res) => {
  const { status, comments } = req.body;
  const valid = ['pass', 'fail', 'blocked', 'not_executed'];
  if (!valid.includes(status)) return res.status(400).json({ error: `status must be one of ${valid.join(', ')}` });

  const testCaseId = req.params.testCaseId;
  const existing = await db.get('SELECT * FROM test_execution WHERE test_case_id = ?', [testCaseId]);

  if (existing) {
    await db.run(`
      UPDATE test_execution SET status=?, comments=?, executed_by=?, executed_at=NOW()
      WHERE test_case_id = ?
    `, [status, comments || '', req.user.id, testCaseId]);
  } else {
    await db.run(`
      INSERT INTO test_execution (test_case_id, status, comments, executed_by, executed_at)
      VALUES (?, ?, ?, ?, NOW())
    `, [testCaseId, status, comments || '', req.user.id]);
  }
  res.json(await db.get('SELECT * FROM test_execution WHERE test_case_id = ?', [testCaseId]));
};

exports.getForTestCase = async (req, res) => {
  const row = await db.get('SELECT * FROM test_execution WHERE test_case_id = ?', [req.params.testCaseId]);
  res.json(row || null);
};
