const { pool } = require('../config/db');

async function getUsers(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
}

async function getTrips(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT trips.*, users.name AS user_name, users.email AS user_email
       FROM trips JOIN users ON trips.user_id = users.id
       ORDER BY trips.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function getSOSAlerts(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT sos_alerts.*, users.name AS user_name, users.phone AS user_phone
       FROM sos_alerts JOIN users ON sos_alerts.user_id = users.id
       ORDER BY sos_alerts.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function getAnalytics(req, res, next) {
  try {
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users WHERE role = "tourist"');
    const [[{ totalTrips }]] = await pool.query('SELECT COUNT(*) AS totalTrips FROM trips');
    const [[{ activeSOS }]] = await pool.query('SELECT COUNT(*) AS activeSOS FROM sos_alerts WHERE status = "active"');
    const [[{ highRiskLogs }]] = await pool.query('SELECT COUNT(*) AS highRiskLogs FROM risk_logs WHERE risk_level = "high"');
    const [riskBreakdown] = await pool.query('SELECT risk_level, COUNT(*) AS count FROM risk_logs GROUP BY risk_level');

    res.json({ totalUsers, totalTrips, activeSOS, highRiskLogs, riskBreakdown });
  } catch (err) { next(err); }
}

async function getLatestLocations(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT l1.id, l1.user_id, l1.latitude, l1.longitude, l1.recorded_at, users.name
       FROM locations l1
       INNER JOIN (
         SELECT user_id, MAX(recorded_at) as max_rec
         FROM locations
         GROUP BY user_id
       ) l2 ON l1.user_id = l2.user_id AND l1.recorded_at = l2.max_rec
       JOIN users ON l1.user_id = users.id`
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function getRiskHeatmap(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, user_id, location_name, latitude, longitude, risk_score, risk_level, created_at 
       FROM risk_logs 
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL
       ORDER BY created_at DESC LIMIT 500`
    );
    res.json(rows);
  } catch (err) { next(err); }
}

module.exports = { getUsers, getTrips, getSOSAlerts, getAnalytics, getLatestLocations, getRiskHeatmap };

