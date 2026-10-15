const { pool } = require('../config/db');

async function getBroadcasts(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM broadcast_alerts ORDER BY created_at DESC LIMIT 20');
    res.json(rows);
  } catch (err) { next(err); }
}

async function createBroadcast(req, res, next) {
  try {
    const { title, message, severity } = req.body;
    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO broadcast_alerts (title, message, severity, created_by) VALUES (?, ?, ?, ?)',
      [title, message, severity || 'warning', req.user.id]
    );

    const broadcastPayload = {
      id: result.insertId,
      title,
      message,
      severity: severity || 'warning',
      createdBy: req.user.name,
      created_at: new Date().toISOString()
    };

    // Emit to ALL connected clients instantly
    try {
      const io = req.app.get('io');
      io.emit('broadcast:alert', broadcastPayload);
    } catch (emitErr) {
      console.warn('Socket broadcast failed:', emitErr.message);
    }

    res.status(201).json(broadcastPayload);
  } catch (err) { next(err); }
}

module.exports = { getBroadcasts, createBroadcast };
