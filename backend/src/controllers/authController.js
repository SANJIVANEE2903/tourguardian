const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res, next) {
  try {
    const { name, email, password, phone, nationality } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, nationality, role) VALUES (?, ?, ?, ?, ?, "tourist")',
      [name, email, hash, phone || null, nationality || null]
    );

    const user = { id: result.insertId, name, email, role: 'tourist' };
    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const dbUser = rows[0];
    const match = await bcrypt.compare(password, dbUser.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = { id: dbUser.id, name: dbUser.name, email: dbUser.email, role: dbUser.role };
    const token = signToken(user);
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
