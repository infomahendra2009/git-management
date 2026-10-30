const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'qa_management',
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true, // keep DATETIME columns as plain strings, matching the old SQLite behavior
});

// Small helpers so controllers don't need to know mysql2's [rows, fields] return shape.
async function query(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function get(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] || null;
}

// For INSERT/UPDATE/DELETE — returns { insertId, affectedRows, ... }
async function run(sql, params = []) {
  const [result] = await pool.query(sql, params);
  return result;
}

// Runs `fn(conn)` inside a transaction; conn has the same query/get/run-style helpers.
async function transaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const helpers = {
      query: async (sql, params = []) => (await conn.query(sql, params))[0],
      get: async (sql, params = []) => ((await conn.query(sql, params))[0])[0] || null,
      run: async (sql, params = []) => (await conn.query(sql, params))[0],
    };
    const result = await fn(helpers);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','qa') NOT NULL DEFAULT 'qa',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  archived TINYINT(1) NOT NULL DEFAULT 0,
  created_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS releases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  version VARCHAR(100) NOT NULL,
  status ENUM('draft','published','closed') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  closed_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL,
  release_id INT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assigned_to INT NULL,
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  status ENUM('todo','in_progress','done') NOT NULL DEFAULT 'todo',
  due_date DATE NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS test_cases (
  id INT PRIMARY KEY AUTO_INCREMENT,
  task_id INT NOT NULL,
  code VARCHAR(50),
  feature VARCHAR(255),
  scenario TEXT NOT NULL,
  expected_result TEXT,
  severity ENUM('critical','high','medium','low') NOT NULL DEFAULT 'medium',
  priority ENUM('low','medium','high','critical') NOT NULL DEFAULT 'medium',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS test_execution (
  id INT PRIMARY KEY AUTO_INCREMENT,
  test_case_id INT NOT NULL,
  status ENUM('pass','fail','blocked','not_executed') NOT NULL DEFAULT 'not_executed',
  comments TEXT,
  executed_by INT NULL,
  executed_at DATETIME NULL,
  FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
  FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reports (
  id INT PRIMARY KEY AUTO_INCREMENT,
  release_id INT NOT NULL,
  type ENUM('daily','release') NOT NULL DEFAULT 'release',
  summary_json TEXT NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT
) ENGINE=InnoDB;
`;

// The MySQL container can take a few seconds to accept connections even once "up",
// and CREATE TABLE statements must run one at a time — mysql2 won't multi-statement
// them without an explicit opt-in, so split on the blank-line-terminated `;`.
async function initSchema(retries = 20, delayMs = 1500) {
  const statements = SCHEMA.split(';').map(s => s.trim()).filter(Boolean);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await pool.getConnection();
      try {
        for (const stmt of statements) {
          await conn.query(stmt);
        }
      } finally {
        conn.release();
      }
      console.log('MySQL schema ready.');
      return;
    } catch (err) {
      console.log(`Waiting for MySQL… (attempt ${attempt}/${retries}: ${err.code || err.message})`);
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}

module.exports = { pool, query, get, run, transaction, initSchema };
