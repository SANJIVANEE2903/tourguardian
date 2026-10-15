const { pool } = require('../config/db');
const { checkAndWarnSevereWeather } = require('../utils/weatherService');

async function createTrip(req, res, next) {
  try {
    const { title, destination, start_date, end_date, itinerary } = req.body;
    if (!title || !destination) {
      return res.status(400).json({ message: 'title and destination are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO trips (user_id, title, destination, start_date, end_date, itinerary, status) VALUES (?, ?, ?, ?, ?, ?, "planned")',
      [req.user.id, title, destination, start_date || null, end_date || null, JSON.stringify(itinerary || [])]
    );
    const [rows] = await pool.query('SELECT * FROM trips WHERE id = ?', [result.insertId]);

    // Asynchronously check for severe weather warnings via Open-Meteo
    checkAndWarnSevereWeather(req.user.id, destination, start_date, end_date);

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

async function getTrips(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function getTripById(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM trips WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Trip not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function updateTrip(req, res, next) {
  try {
    const { title, destination, start_date, end_date, itinerary, status } = req.body;
    const [existing] = await pool.query('SELECT * FROM trips WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Trip not found.' });

    await pool.query(
      `UPDATE trips SET
        title = COALESCE(?, title),
        destination = COALESCE(?, destination),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        itinerary = COALESCE(?, itinerary),
        status = COALESCE(?, status)
       WHERE id = ? AND user_id = ?`,
      [title, destination, start_date, end_date, itinerary ? JSON.stringify(itinerary) : null, status, req.params.id, req.user.id]
    );
    const [rows] = await pool.query('SELECT * FROM trips WHERE id = ?', [req.params.id]);

    if (destination || start_date) {
      checkAndWarnSevereWeather(req.user.id, destination || existing[0].destination, start_date || existing[0].start_date, end_date || existing[0].end_date);
    }

    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function checkTripWeather(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM trips WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Trip not found.' });

    const trip = rows[0];
    const result = await checkAndWarnSevereWeather(req.user.id, trip.destination, trip.start_date, trip.end_date);
    res.json({ message: 'Weather check completed', result });
  } catch (err) { next(err); }
}

async function deleteTrip(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM trips WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Trip not found.' });
    res.json({ message: 'Trip deleted.' });
  } catch (err) { next(err); }
}

module.exports = { createTrip, getTrips, getTripById, updateTrip, checkTripWeather, deleteTrip };

