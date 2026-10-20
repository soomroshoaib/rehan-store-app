require('dotenv').config();
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev-secret-change-before-going-live';
  console.warn('JWT_SECRET is not set; using the development secret.');
}
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./db');
const seedData = require('./seedData');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to the DB only once (not on every request in serverless)
let ready;
const ensureDB = () => (ready ||= connectDB().then(seedData).catch((e) => { ready = null; throw e; }));
app.use('/api', async (req, res, next) => {
  try { await ensureDB(); next(); } catch (e) { next(e); }
});

app.use('/api/images', require('./routes/images'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/admin', require('./routes/admin'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  ensureDB()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((e) => {
      console.error('Could not start database:', e.message);
      process.exit(1);
    });
}
