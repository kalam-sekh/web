const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());
const path = require('path');

// Serve static files (frontend) from project root so pages are available over HTTP
app.use(express.static(path.join(__dirname)));

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:wNEvRTpIpnfKQymfPITfKjyZoHyYyKem@zephyr.proxy.rlwy.net:51015/railway';

const pool = new Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function ensureTable() {
  const create = `
    CREATE TABLE IF NOT EXISTS connect_requests (
      id BIGSERIAL PRIMARY KEY,
      connect_id VARCHAR(8) UNIQUE NOT NULL,
      option_key VARCHAR(64),
      name TEXT,
      mobile TEXT,
      email TEXT,
      country TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  `;
  await pool.query(create);
}

function random8() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function insertWithUniqueId(payload) {
  for (let i = 0; i < 6; i++) {
    const connect_id = random8();
    try {
      const q = `INSERT INTO connect_requests(connect_id, option_key, name, mobile, email, country) VALUES($1,$2,$3,$4,$5,$6) RETURNING id, connect_id`;
      const values = [connect_id, payload.option, payload.name, payload.mobile, payload.email, payload.country];
      const res = await pool.query(q, values);
      return res.rows[0];
    } catch (err) {
      // unique violation -> retry
      if (err.code === '23505') continue;
      throw err;
    }
  }
  throw new Error('Unable to generate unique connect id');
}

app.post('/api/connect', async (req, res) => {
  const { option, name, mobile, email, country } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  try {
    const inserted = await insertWithUniqueId({ option, name, mobile, email, country });
    return res.json({ success: true, connect_id: inserted.connect_id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'DB error' });
  }
});

const port = process.env.PORT || 3000;

(async () => {
  try {
    await ensureTable();
    app.listen(port, () => console.log(`API server listening on ${port}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
