const { pool } = require('../config/db');

// Haversine formula to compute distance between two GPS coordinates in meters
function getHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function getGeofences(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM geofences ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) { next(err); }
}

async function createGeofence(req, res, next) {
  try {
    const { name, type, latitude, longitude, radius_meters, description } = req.body;
    if (!name || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Name, latitude, and longitude are required.' });
    }
    const [result] = await pool.query(
      'INSERT INTO geofences (name, type, latitude, longitude, radius_meters, description) VALUES (?, ?, ?, ?, ?, ?)',
      [name, type || 'danger', latitude, longitude, radius_meters || 500, description || null]
    );
    res.status(201).json({ id: result.insertId, name, type, latitude, longitude, radius_meters, description });
  } catch (err) { next(err); }
}

async function deleteGeofence(req, res, next) {
  try {
    await pool.query('DELETE FROM geofences WHERE id = ?', [req.params.id]);
    res.json({ message: 'Geofence deleted.' });
  } catch (err) { next(err); }
}

// Internal spatial check function used by location update pipeline
async function checkGeofencesForLocation(userId, userName, latitude, longitude, io) {
  try {
    const [geofences] = await pool.query('SELECT * FROM geofences');
    const breached = [];

    for (const gf of geofences) {
      const dist = getHaversineDistance(latitude, longitude, Number(gf.latitude), Number(gf.longitude));
      if (dist <= gf.radius_meters) {
        breached.push({ ...gf, distanceMeters: Math.round(dist) });
      }
    }

    if (breached.length > 0 && io) {
      for (const b of breached) {
        // Log alert in database
        await pool.query(
          'INSERT INTO geofence_alerts (user_id, geofence_id, action) VALUES (?, ?, "entered")',
          [userId, b.id]
        );

        const alertPayload = {
          userId,
          userName,
          geofenceName: b.name,
          geofenceType: b.type,
          description: b.description,
          latitude,
          longitude,
          distanceMeters: b.distanceMeters,
          timestamp: new Date().toISOString()
        };

        // Notify admins and user in real time over sockets
        io.to('admins').emit('geofence:breach', alertPayload);
        io.to(`user:${userId}`).emit('geofence:warning', alertPayload);
      }
    }
    return breached;
  } catch (err) {
    console.warn('Geofence check error:', err.message);
    return [];
  }
}

module.exports = { getGeofences, createGeofence, deleteGeofence, checkGeofencesForLocation, getHaversineDistance };
