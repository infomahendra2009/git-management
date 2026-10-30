require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/releases', require('./routes/releases'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/test-cases', require('./routes/testCases'));
app.use('/api/execution', require('./routes/execution'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/public', require('./routes/public'));
app.use('/api/settings', require('./routes/settings'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;

db.initSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`QA Management API listening on :${PORT}`));
  })
  .catch((err) => {
    console.error('Could not connect to MySQL — giving up.', err);
    process.exit(1);
  });
