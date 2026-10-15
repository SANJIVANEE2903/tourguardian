const { pool } = require('../config/db');

async function getCheckinStatus(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM checkin_timers WHERE user_id = ?', [req.user.id]);
    if (rows.length === 0) {
      return res.json({ status: 'disabled', interval_minutes: 120 });
    }
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function setCheckinTimer(req, res, next) {
  try {
    const { interval_minutes, status } = req.body;
    const interval = Number(interval_minutes) || 120;
    const newStatus = status === 'disabled' ? 'disabled' : 'active';

    const nextTime = new Date(Date.now() + interval * 60 * 1000);

    await pool.query(
      `INSERT INTO checkin_timers (user_id, interval_minutes, last_checkin_at, next_checkin_at, status)
       VALUES (?, ?, NOW(), ?, ?)
       ON DUPLICATE KEY UPDATE interval_minutes = ?, next_checkin_at = ?, status = ?`,
      [req.user.id, interval, nextTime, newStatus, interval, nextTime, newStatus]
    );

    res.json({ message: 'Safety check-in timer updated.', interval_minutes: interval, status: newStatus, next_checkin_at: nextTime });
  } catch (err) { next(err); }
}

async function recordCheckin(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT interval_minutes FROM checkin_timers WHERE user_id = ?', [req.user.id]);
    const interval = rows.length > 0 ? rows[0].interval_minutes : 120;
    const nextTime = new Date(Date.now() + interval * 60 * 1000);

    await pool.query(
      `UPDATE checkin_timers SET last_checkin_at = NOW(), next_checkin_at = ?, status = "active" WHERE user_id = ?`,
      [nextTime, req.user.id]
    );

    res.json({ message: 'Safety check-in recorded successfully!', next_checkin_at: nextTime, status: 'active' });
  } catch (err) { next(err); }
}

async function getOverdueCheckins(req, res, next) {
  try {
    // Flag any past-due active checkins as overdue
    await pool.query('UPDATE checkin_timers SET status = "overdue" WHERE status = "active" AND next_checkin_at < NOW()');

    const [rows] = await pool.query(
      `SELECT c.*, users.name, users.email, users.phone
       FROM checkin_timers c
       JOIN users ON c.user_id = users.id
       WHERE c.status = "overdue"
       ORDER BY c.next_checkin_at ASC`
    );

    res.json(rows);
  } catch (err) { next(err); }
}

module.exports = { getCheckinStatus, setCheckinTimer, recordCheckin, getOverdueCheckins };
