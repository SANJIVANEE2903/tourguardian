const { pool } = require('../config/db');

async function createHazard(req, res, next) {
  try {
    const { type, note, latitude, longitude } = req.body;
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: 'Latitude and longitude are required to report a hazard.' });
    }

    const validTypes = ['unsafe', 'scam', 'other'];
    const hazardType = validTypes.includes(type) ? type : 'unsafe';

    const [result] = await pool.query(
      'INSERT INTO hazard_reports (user_id, type, note, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, hazardType, note || null, latitude, longitude]
    );

    const [rows] = await pool.query(
      `SELECT hazard_reports.*, users.name as user_name 
       FROM hazard_reports 
       JOIN users ON hazard_reports.user_id = users.id 
       WHERE hazard_reports.id = ?`,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

async function getHazards(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT hazard_reports.*, users.name as user_name 
       FROM hazard_reports 
       JOIN users ON hazard_reports.user_id = users.id 
       ORDER BY hazard_reports.created_at DESC LIMIT 100`
    );
    res.json(rows);
  } catch (err) { next(err); }
}

async function deleteHazard(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM hazard_reports WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Hazard report not found.' });
    }
    res.json({ message: 'Hazard report deleted.' });
  } catch (err) { next(err); }
}

module.exports = { createHazard, getHazards, deleteHazard };
