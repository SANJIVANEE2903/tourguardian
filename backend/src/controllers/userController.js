const { pool } = require('../config/db');

async function getProfile(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, nationality, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const { name, phone, nationality } = req.body;
    await pool.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), nationality = COALESCE(?, nationality) WHERE id = ?',
      [name, phone, nationality, req.user.id]
    );
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, nationality, role FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function getSafetyHistory(req, res, next) {
  try {
    const [sos] = await pool.query(
      'SELECT * FROM sos_alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    const [risks] = await pool.query(
      'SELECT * FROM risk_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json({ sosHistory: sos, riskHistory: risks });
  } catch (err) { next(err); }
}

module.exports = { getProfile, updateProfile, getSafetyHistory };
