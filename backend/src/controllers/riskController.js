const { pool } = require('../config/db');
const { assessRisk } = require('../utils/riskEngine');

async function assess(req, res, next) {
  try {
    const { locationName, latitude, longitude, trip_id } = req.body;
    if (!locationName && (latitude === undefined || longitude === undefined)) {
      return res.status(400).json({ message: 'Provide locationName or latitude/longitude.' });
    }

    const result = await assessRisk({ locationName, latitude, longitude });

    await pool.query(
      'INSERT INTO risk_logs (user_id, trip_id, location_name, latitude, longitude, risk_score, risk_level, factors) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, trip_id || null, locationName || null, latitude || null, longitude || null, result.score, result.level, JSON.stringify(result.factors)]
    );

    if (result.level === 'high') {
      await pool.query(
        'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "risk")',
        [req.user.id, 'High Risk Area Detected', `${locationName || 'Your current location'} was flagged as high risk. Review recommendations in the Risk Dashboard.`]
      );
    }

    res.json(result);
  } catch (err) { next(err); }
}

async function history(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM risk_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
}

module.exports = { assess, history };
