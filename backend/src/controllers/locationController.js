const { pool } = require('../config/db');
const { checkGeofencesForLocation } = require('./geofenceController');

async function updateLocation(req, res, next) {
  try {
    const { latitude, longitude, trip_id } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'latitude and longitude are required.' });
    }
    await pool.query(
      'INSERT INTO locations (user_id, trip_id, latitude, longitude) VALUES (?, ?, ?, ?)',
      [req.user.id, trip_id || null, latitude, longitude]
    );

    // Push live position to admins watching the map in real time.
    let breached = [];
    try {
      const io = req.app.get('io');
      io.to('admins').emit('location:update', {
        userId: req.user.id,
        name: req.user.name,
        latitude,
        longitude,
        recorded_at: new Date().toISOString()
      });

      // Spatial Geofence Check
      breached = await checkGeofencesForLocation(req.user.id, req.user.name, latitude, longitude, io);
    } catch (emitErr) {
      console.warn('Socket/Geofence emit failed:', emitErr.message);
    }

    res.status(201).json({ message: 'Location updated.', geofencesBreached: breached });
  } catch (err) { next(err); }
}

async function getLiveLocation(req, res, next) {
  try {
    const userId = req.params.userId || req.user.id;
    if (Number(userId) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this location.' });
    }
    const [rows] = await pool.query(
      'SELECT * FROM locations WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 1',
      [userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'No location data yet.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function getLocationHistory(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM locations WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 100',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
}

module.exports = { updateLocation, getLiveLocation, getLocationHistory };
