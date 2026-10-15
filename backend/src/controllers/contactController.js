const { pool } = require('../config/db');

async function listContacts(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
}

async function addContact(req, res, next) {
  try {
    const { name, phone, relation } = req.body;
    if (!name || !phone) return res.status(400).json({ message: 'name and phone are required.' });
    const [result] = await pool.query(
      'INSERT INTO emergency_contacts (user_id, name, phone, relation) VALUES (?, ?, ?, ?)',
      [req.user.id, name, phone, relation || null]
    );
    const [rows] = await pool.query('SELECT * FROM emergency_contacts WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
}

async function updateContact(req, res, next) {
  try {
    const { name, phone, relation } = req.body;
    const [existing] = await pool.query('SELECT * FROM emergency_contacts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (existing.length === 0) return res.status(404).json({ message: 'Contact not found.' });
    await pool.query(
      'UPDATE emergency_contacts SET name = COALESCE(?, name), phone = COALESCE(?, phone), relation = COALESCE(?, relation) WHERE id = ?',
      [name, phone, relation, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM emergency_contacts WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
}

async function deleteContact(req, res, next) {
  try {
    const [result] = await pool.query('DELETE FROM emergency_contacts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Contact not found.' });
    res.json({ message: 'Contact deleted.' });
  } catch (err) { next(err); }
}

module.exports = { listContacts, addContact, updateContact, deleteContact };
