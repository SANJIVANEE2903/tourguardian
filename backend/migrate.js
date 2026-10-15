const { pool } = require('./src/config/db');

async function migrate() {
  try {
    console.log('Starting migration...');

    await pool.query(`CREATE TABLE IF NOT EXISTS geofences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      type ENUM('safe', 'caution', 'danger') DEFAULT 'danger',
      latitude DECIMAL(10,8) NOT NULL,
      longitude DECIMAL(11,8) NOT NULL,
      radius_meters INT DEFAULT 500,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS geofence_alerts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      geofence_id INT NOT NULL,
      action ENUM('entered', 'exited') DEFAULT 'entered',
      recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (geofence_id) REFERENCES geofences(id) ON DELETE CASCADE
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS broadcast_alerts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      severity ENUM('info', 'warning', 'critical') DEFAULT 'warning',
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS checkin_timers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      interval_minutes INT DEFAULT 120,
      last_checkin_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      next_checkin_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      status ENUM('active', 'overdue', 'disabled') DEFAULT 'active',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS hazard_reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      type ENUM('unsafe', 'scam', 'other') DEFAULT 'unsafe',
      note TEXT,
      latitude DECIMAL(10,8) NOT NULL,
      longitude DECIMAL(11,8) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);


    const [cols] = await pool.query('SHOW COLUMNS FROM sos_alerts');
    const names = cols.map(c => c.Field);
    if (!names.includes('assigned_to')) await pool.query('ALTER TABLE sos_alerts ADD COLUMN assigned_to VARCHAR(100) DEFAULT NULL');
    if (!names.includes('responder_notes')) await pool.query('ALTER TABLE sos_alerts ADD COLUMN responder_notes TEXT DEFAULT NULL');
    if (!names.includes('eta_minutes')) await pool.query('ALTER TABLE sos_alerts ADD COLUMN eta_minutes INT DEFAULT NULL');
    if (!names.includes('resolved_at')) await pool.query('ALTER TABLE sos_alerts ADD COLUMN resolved_at TIMESTAMP NULL DEFAULT NULL');

    const [gf] = await pool.query('SELECT COUNT(*) as count FROM geofences');
    if (gf[0].count === 0) {
      await pool.query(`INSERT INTO geofences (name, type, latitude, longitude, radius_meters, description) VALUES
        ('Mumbai High Crime Risk Zone', 'danger', 19.0760, 72.8777, 1000, 'Caution: High crime density reported after 10 PM'),
        ('Colaba Tourist Safe Zone', 'safe', 18.9220, 72.8347, 1500, '24/7 Tourist Police Patrol and Emergency Hub'),
        ('Old Delhi Traffic & Storm Risk Zone', 'caution', 28.6562, 77.2310, 1200, 'Severe weather and crowd surges reported')
      `);
    }

    console.log('✅ Enterprise schema migration finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
