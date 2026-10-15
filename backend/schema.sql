-- =============================================================================
--  TourGuardian — Full Database Schema
--  MySQL 8+ / MariaDB 10.5+
--
--  HOW TO RUN:
--    mysql -u root -p < schema.sql
--
--  This file covers:
--    1.  Database creation
--    2.  All table definitions (with FK relationships)
--    3.  Sample INSERT rows — showing how each feature stores data
--    4.  Sample UPDATE statements — showing how each feature mutates data
--    5.  Key SELECT queries used by the API
-- =============================================================================


-- =============================================================================
-- 1. DATABASE
-- =============================================================================
CREATE DATABASE IF NOT EXISTS tourguardian
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE tourguardian;


-- =============================================================================
-- 2. TABLE DEFINITIONS
-- =============================================================================

-- ── 2.1  users ────────────────────────────────────────────────────────────────
--  Stores every registered tourist and admin.
--  Passwords are bcrypt-hashed before storage.
--  role: 'tourist' (default on register) | 'admin' (set manually in DB)
CREATE TABLE IF NOT EXISTS users (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password      VARCHAR(255)  NOT NULL,          -- bcrypt hash
  phone         VARCHAR(20)   DEFAULT NULL,
  nationality   VARCHAR(80)   DEFAULT NULL,
  role          ENUM('tourist','admin') DEFAULT 'tourist',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── 2.2  trips ────────────────────────────────────────────────────────────────
--  Trip itinerary planned by a tourist.
--  `itinerary` is a JSON array of day-by-day plan objects.
--  status lifecycle: planned → active → completed / cancelled
CREATE TABLE IF NOT EXISTS trips (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  destination   VARCHAR(200)  NOT NULL,
  start_date    DATE          DEFAULT NULL,
  end_date      DATE          DEFAULT NULL,
  itinerary     JSON          DEFAULT NULL,       -- [{"day":1,"plan":"..."}]
  status        ENUM('planned','active','completed','cancelled') DEFAULT 'planned',
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 2.3  locations ────────────────────────────────────────────────────────────
--  Live GPS pings sent by the tourist app every N seconds.
--  Keeps full history; latest row = current position.
CREATE TABLE IF NOT EXISTS locations (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  trip_id       INT           DEFAULT NULL,
  latitude      DECIMAL(10,8) NOT NULL,
  longitude     DECIMAL(11,8) NOT NULL,
  recorded_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (trip_id)  REFERENCES trips(id)  ON DELETE SET NULL
);

-- ── 2.4  sos_alerts ───────────────────────────────────────────────────────────
--  Created when tourist presses the SOS button.
--  Dispatch lifecycle: active → (admin assigns responder) → resolved
--  Extra admin columns added via migrate.js if not present.
CREATE TABLE IF NOT EXISTS sos_alerts (
  id              INT           AUTO_INCREMENT PRIMARY KEY,
  user_id         INT           NOT NULL,
  trip_id         INT           DEFAULT NULL,
  latitude        DECIMAL(10,8) DEFAULT NULL,
  longitude       DECIMAL(11,8) DEFAULT NULL,
  message         TEXT          DEFAULT NULL,
  status          ENUM('active','resolved') DEFAULT 'active',
  assigned_to     VARCHAR(100)  DEFAULT NULL,    -- responder name / unit
  responder_notes TEXT          DEFAULT NULL,
  eta_minutes     INT           DEFAULT NULL,
  resolved_at     TIMESTAMP     NULL DEFAULT NULL,
  created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (trip_id)  REFERENCES trips(id)  ON DELETE SET NULL
);

-- ── 2.5  emergency_contacts ───────────────────────────────────────────────────
--  Phone/email contacts to notify on SOS.
--  'relationship' stores family / friend / colleague etc.
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  name          VARCHAR(100)  NOT NULL,
  phone         VARCHAR(30)   NOT NULL,
  email         VARCHAR(150)  DEFAULT NULL,
  relation      VARCHAR(80)   DEFAULT NULL,      -- "Mother", "Friend" etc.
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 2.6  notifications ────────────────────────────────────────────────────────
--  In-app notification records (SOS ack, risk alerts, weather warnings).
--  type: 'sos' | 'risk' | 'weather' | 'geofence' | 'system'
CREATE TABLE IF NOT EXISTS notifications (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  title         VARCHAR(200)  NOT NULL,
  message       TEXT          NOT NULL,
  type          VARCHAR(30)   DEFAULT 'system',
  is_read       TINYINT(1)    DEFAULT 0,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 2.7  risk_logs ────────────────────────────────────────────────────────────
--  Every AI risk assessment result is persisted here.
--  `factors` is a JSON array of risk factor strings.
--  risk_level: 'low' | 'medium' | 'high'
CREATE TABLE IF NOT EXISTS risk_logs (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  trip_id       INT           DEFAULT NULL,
  location_name VARCHAR(200)  DEFAULT NULL,
  latitude      DECIMAL(10,8) DEFAULT NULL,
  longitude     DECIMAL(11,8) DEFAULT NULL,
  risk_score    INT           DEFAULT 0,          -- 0-100
  risk_level    ENUM('low','medium','high') DEFAULT 'low',
  factors       JSON          DEFAULT NULL,       -- ["High crime area","Night time"]
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (trip_id)  REFERENCES trips(id)  ON DELETE SET NULL
);

-- ── 2.8  geofences ────────────────────────────────────────────────────────────
--  Admin-defined geo-zones.  type drives the alert severity on breach.
CREATE TABLE IF NOT EXISTS geofences (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  type          ENUM('safe','caution','danger') DEFAULT 'danger',
  latitude      DECIMAL(10,8) NOT NULL,
  longitude     DECIMAL(11,8) NOT NULL,
  radius_meters INT           DEFAULT 500,
  description   TEXT          DEFAULT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── 2.9  geofence_alerts ──────────────────────────────────────────────────────
--  Logged every time a tourist enters or exits a geofence zone.
CREATE TABLE IF NOT EXISTS geofence_alerts (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  geofence_id   INT           NOT NULL,
  action        ENUM('entered','exited') DEFAULT 'entered',
  recorded_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (geofence_id) REFERENCES geofences(id) ON DELETE CASCADE
);

-- ── 2.10  broadcast_alerts ────────────────────────────────────────────────────
--  Mass alerts pushed by admin to all tourists (e.g. flood, civil unrest).
--  severity: 'info' | 'warning' | 'critical'
CREATE TABLE IF NOT EXISTS broadcast_alerts (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(150)  NOT NULL,
  message       TEXT          NOT NULL,
  severity      ENUM('info','warning','critical') DEFAULT 'warning',
  created_by    INT           DEFAULT NULL,       -- admin user id
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

-- ── 2.11  checkin_timers ──────────────────────────────────────────────────────
--  One row per user (UNIQUE on user_id).
--  status lifecycle: active → overdue (auto-flagged) | disabled
CREATE TABLE IF NOT EXISTS checkin_timers (
  id                INT       AUTO_INCREMENT PRIMARY KEY,
  user_id           INT       NOT NULL UNIQUE,
  interval_minutes  INT       DEFAULT 120,
  last_checkin_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_checkin_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status            ENUM('active','overdue','disabled') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── 2.12  hazard_reports ──────────────────────────────────────────────────────
--  User-submitted map pins reporting unsafe locations.
--  type: 'unsafe' | 'scam' | 'other'
CREATE TABLE IF NOT EXISTS hazard_reports (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  user_id       INT           NOT NULL,
  type          ENUM('unsafe','scam','other') DEFAULT 'unsafe',
  note          TEXT          DEFAULT NULL,
  latitude      DECIMAL(10,8) NOT NULL,
  longitude     DECIMAL(11,8) NOT NULL,
  created_at    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =============================================================================
-- 3. SAMPLE DATA  (shows how data is stored for each feature)
-- =============================================================================

-- ── 3.1  Users ────────────────────────────────────────────────────────────────
--  Passwords shown as '$2b$10$...' placeholders (real app uses bcrypt hash).
--  INSERT IGNORE skips rows whose email already exists (safe to re-run).
INSERT IGNORE INTO users (name, email, password, phone, nationality, role) VALUES
  ('Admin User',  'admin@tourguardian.com', '$2b$10$PLACEHOLDER_HASH', '+911234567890',  'Indian',  'admin'),
  ('Priya Sharma','priya@example.com',      '$2b$10$PLACEHOLDER_HASH', '+919876543210',  'Indian',  'tourist'),
  ('James Wilson','james@example.com',      '$2b$10$PLACEHOLDER_HASH', '+447700900123',  'British', 'tourist'),
  ('Mei Lin',     'mei@example.com',        '$2b$10$PLACEHOLDER_HASH', '+8613800138000', 'Chinese', 'tourist');

-- ── 3.2  Trips ────────────────────────────────────────────────────────────────
INSERT IGNORE INTO trips (user_id, title, destination, start_date, end_date, itinerary, status)
SELECT u.id, t.title, t.dest, t.sd, t.ed, t.itin, t.stat FROM users u
JOIN (
  SELECT 'priya@example.com' AS email, 'Golden Triangle Tour' AS title,
         'Delhi-Agra-Jaipur' AS dest, '2025-10-01' AS sd, '2025-10-10' AS ed,
         '[{"day":1,"plan":"Arrive Delhi, India Gate"},{"day":2,"plan":"Agra: Taj Mahal"},{"day":3,"plan":"Jaipur: Amber Fort"}]' AS itin,
         'planned' AS stat
  UNION ALL
  SELECT 'james@example.com', 'Kerala Backwaters', 'Alleppey, Kerala',
         '2025-11-05', '2025-11-12',
         '[{"day":1,"plan":"Arrive Kochi"},{"day":2,"plan":"Houseboat cruise Alleppey"}]',
         'active'
  UNION ALL
  SELECT 'mei@example.com', 'Rajasthan Desert Safari', 'Jaisalmer',
         '2025-12-20', '2025-12-28',
         '[{"day":1,"plan":"Arrive Jaisalmer"},{"day":2,"plan":"Camel Safari, Sam Sand Dunes"}]',
         'planned'
) t ON u.email = t.email;

-- ── 3.3  Live Locations ───────────────────────────────────────────────────────
INSERT INTO locations (user_id, latitude, longitude)
SELECT id, 28.6139, 77.2090 FROM users WHERE email = 'priya@example.com';
INSERT INTO locations (user_id, latitude, longitude)
SELECT id, 27.1751, 78.0421 FROM users WHERE email = 'priya@example.com';
INSERT INTO locations (user_id, latitude, longitude)
SELECT id, 9.9312,  76.2673 FROM users WHERE email = 'james@example.com';
INSERT INTO locations (user_id, latitude, longitude)
SELECT id, 26.9157, 70.9083 FROM users WHERE email = 'mei@example.com';

-- ── 3.4  SOS Alerts ───────────────────────────────────────────────────────────
INSERT INTO sos_alerts (user_id, latitude, longitude, message, status, assigned_to, responder_notes, eta_minutes)
SELECT id, 27.1751, 78.0421, 'Bag snatched near Taj Mahal East Gate!', 'active',
       'Officer Ramesh - Agra Tourist Police', 'Patrolling East Gate, en route', 8
FROM users WHERE email = 'priya@example.com';

INSERT INTO sos_alerts (user_id, latitude, longitude, message, status, assigned_to, responder_notes, eta_minutes, resolved_at)
SELECT id, 9.9312, 76.2673, 'Medical emergency, unconscious tourist', 'resolved',
       'Dr Anita - Kochi ER', 'Stabilised at hospital', 12, NOW()
FROM users WHERE email = 'james@example.com';

-- ── 3.5  Emergency Contacts ───────────────────────────────────────────────────
INSERT INTO emergency_contacts (user_id, name, phone, email, relation)
SELECT u.id, c.cname, c.phone, c.email, c.rel FROM users u
JOIN (
  SELECT 'priya@example.com' AS uemail, 'Rahul Sharma'  AS cname, '+919876000001' AS phone, 'rahul@example.com'  AS email, 'Brother' AS rel
  UNION ALL
  SELECT 'priya@example.com', 'Sunita Sharma', '+919876000002', 'sunita@example.com', 'Mother'
  UNION ALL
  SELECT 'james@example.com', 'Emma Wilson',   '+447700900999', 'emma@example.com',   'Wife'
  UNION ALL
  SELECT 'mei@example.com',   'Wei Lin',       '+8613900139000','wei@example.com',    'Father'
) c ON u.email = c.uemail;

-- ── 3.6  Notifications ────────────────────────────────────────────────────────
INSERT INTO notifications (user_id, title, message, type)
SELECT u.id, n.title, n.msg, n.type FROM users u
JOIN (
  SELECT 'priya@example.com' AS uemail,
         'SOS Dispatch Broadcasted'  AS title,
         'Emergency message dispatched to 2 contact(s). Maps: https://maps.google.com/?q=27.1751,78.0421' AS msg,
         'sos' AS type
  UNION ALL
  SELECT 'priya@example.com',
         'High Risk Area Detected',
         'Agra East Gate was flagged as high risk. Review recommendations in the Risk Dashboard.',
         'risk'
  UNION ALL
  SELECT 'james@example.com',
         'Severe Weather Warning',
         'Heavy monsoon predicted in Kochi from Nov 6-8. Consider rescheduling outdoor activities.',
         'weather'
  UNION ALL
  SELECT 'mei@example.com',
         'Geofence Alert: Danger Zone Entered',
         'You have entered Jaisalmer Desert Night Risk Zone. Stay alert and avoid travelling alone.',
         'geofence'
) n ON u.email = n.uemail;

-- ── 3.7  Risk Logs ────────────────────────────────────────────────────────────
INSERT INTO risk_logs (user_id, location_name, latitude, longitude, risk_score, risk_level, factors)
SELECT u.id, r.loc, r.lat, r.lng, r.score, r.level, r.factors FROM users u
JOIN (
  SELECT 'priya@example.com' AS uemail, 'Agra Old City'   AS loc, 27.1751 AS lat, 78.0421 AS lng, 72 AS score, 'high'   AS level, '["High tourist crime area","Evening hours","Crowded market"]' AS factors
  UNION ALL
  SELECT 'james@example.com', 'Kochi Fort Area', 9.9312,  76.2673, 35, 'medium', '["Moderate crowd density","Safe zone nearby"]'
  UNION ALL
  SELECT 'mei@example.com',   'Sam Sand Dunes',  26.8488, 70.7439, 15, 'low',    '["Daylight hours","Police patrol active"]'
) r ON u.email = r.uemail;

-- ── 3.8  Geofences ────────────────────────────────────────────────────────────
INSERT INTO geofences (name, type, latitude, longitude, radius_meters, description) VALUES
  ('Mumbai High Crime Risk Zone',   'danger',  19.0760, 72.8777, 1000,
   'Caution: High crime density reported after 10 PM'),
  ('Colaba Tourist Safe Zone',      'safe',    18.9220, 72.8347, 1500,
   '24/7 Tourist Police Patrol and Emergency Hub'),
  ('Old Delhi Traffic & Storm Risk','caution',  28.6562, 77.2310, 1200,
   'Severe weather and crowd surges reported'),
  ('Jaisalmer Desert Night Zone',   'danger',  26.9157, 70.9083, 2000,
   'Avoid solo travel after sunset in desert areas');

-- ── 3.9  Geofence Alerts ──────────────────────────────────────────────────────
INSERT INTO geofence_alerts (user_id, geofence_id, action) VALUES
  (4, 4, 'entered'),   -- Mei entered Jaisalmer Desert Night Zone
  (2, 3, 'entered'),   -- Priya entered Old Delhi Traffic Zone
  (2, 3, 'exited');    -- Priya exited Old Delhi Traffic Zone

-- ── 3.10  Broadcast Alerts ────────────────────────────────────────────────────
INSERT INTO broadcast_alerts (title, message, severity, created_by) VALUES
  ('Monsoon Advisory – Kerala',
   'Heavy rainfall expected across Kerala coastline Nov 6-8. All tourists are advised to avoid sea activities.',
   'warning',  1),
  ('Civil Unrest Advisory – Delhi',
   'Protests reported near India Gate. Tourists advised to avoid Rajpath area until further notice.',
   'critical', 1),
  ('TourGuardian System Update',
   'New AI risk assessment v2.0 has been deployed. Your safety scores are now more accurate.',
   'info',     1);

-- ── 3.11  Check-in Timers ─────────────────────────────────────────────────────
--  INSERT IGNORE skips if user already has a timer row (UNIQUE on user_id).
INSERT IGNORE INTO checkin_timers (user_id, interval_minutes, last_checkin_at, next_checkin_at, status)
SELECT u.id, c.mins, NOW(), DATE_ADD(NOW(), INTERVAL c.mins MINUTE), c.stat FROM users u
JOIN (
  SELECT 'priya@example.com' AS uemail, 60  AS mins, 'active'  AS stat
  UNION ALL SELECT 'james@example.com', 120, 'active'
  UNION ALL SELECT 'mei@example.com',    30, 'overdue'
) c ON u.email = c.uemail;

-- ── 3.12  Hazard Reports ──────────────────────────────────────────────────────
INSERT INTO hazard_reports (user_id, type, note, latitude, longitude)
SELECT u.id, h.type, h.note, h.lat, h.lng FROM users u
JOIN (
  SELECT 'priya@example.com' AS uemail, 'scam'   AS type, 'Fake tour guide charging 10x rates near Taj Mahal' AS note, 27.1751 AS lat, 78.0421 AS lng
  UNION ALL SELECT 'james@example.com', 'unsafe', 'Poorly lit alley behind Fort Kochi fish market', 9.9312,  76.2673
  UNION ALL SELECT 'mei@example.com',   'other',  'Camels blocking road near Sam Sand Dunes at night', 26.8488, 70.7439
) h ON u.email = h.uemail;


-- =============================================================================
-- 4. KEY UPDATE STATEMENTS  (shows how data changes during app use)
-- =============================================================================

-- ── 4.1  Promote tourist to admin ─────────────────────────────────────────────
-- UPDATE users SET role = 'admin' WHERE email = 'priya@example.com';

-- ── 4.2  Trip status: planned → active (tourist starts the journey) ───────────
-- UPDATE trips
--   SET status = 'active'
--   WHERE id = 1 AND user_id = 2;

-- ── 4.3  Trip status: active → completed ─────────────────────────────────────
-- UPDATE trips
--   SET status = 'completed'
--   WHERE id = 1 AND user_id = 2;

-- ── 4.4  Trip partial update (title/destination/dates can be changed) ─────────
-- UPDATE trips
--   SET title       = COALESCE('Updated Golden Triangle', title),
--       destination = COALESCE('Delhi-Agra-Jaipur-Varanasi', destination),
--       end_date    = COALESCE('2025-10-15', end_date)
--   WHERE id = 1 AND user_id = 2;

-- ── 4.5  SOS: admin assigns responder and sets ETA ────────────────────────────
-- UPDATE sos_alerts
--   SET assigned_to     = 'Officer Ramesh – Agra Tourist Police',
--       responder_notes = 'Arrived at East Gate, victim located',
--       eta_minutes     = 3,
--       status          = 'active'
--   WHERE id = 1;

-- ── 4.6  SOS: mark as resolved ────────────────────────────────────────────────
-- UPDATE sos_alerts
--   SET status      = 'resolved',
--       resolved_at = NOW()
--   WHERE id = 1;

-- ── 4.7  Emergency contact update ─────────────────────────────────────────────
-- UPDATE emergency_contacts
--   SET name     = COALESCE('Rahul S. Sharma', name),
--       phone    = COALESCE('+919876001234', phone),
--       relation = COALESCE('Elder Brother', relation)
--   WHERE id = 1 AND user_id = 2;

-- ── 4.8  Check-in timer: reset after tourist taps "I'm Safe" button ──────────
-- UPDATE checkin_timers
--   SET last_checkin_at = NOW(),
--       next_checkin_at = DATE_ADD(NOW(), INTERVAL interval_minutes MINUTE),
--       status          = 'active'
--   WHERE user_id = 2;

-- ── 4.9  Check-in timer: system auto-flags missed check-ins as overdue ────────
-- UPDATE checkin_timers
--   SET status = 'overdue'
--   WHERE status = 'active' AND next_checkin_at < NOW();

-- ── 4.10  Mark notification as read ──────────────────────────────────────────
-- UPDATE notifications
--   SET is_read = 1
--   WHERE id = 1 AND user_id = 2;


-- =============================================================================
-- 5. KEY SELECT QUERIES  (mirrors what the API controllers run)
-- =============================================================================

-- ── 5.1  Latest location per tourist (admin live-map view) ───────────────────
-- SELECT l.id, l.user_id, l.latitude, l.longitude, l.recorded_at, u.name
-- FROM locations l
-- INNER JOIN (
--   SELECT user_id, MAX(recorded_at) AS max_rec FROM locations GROUP BY user_id
-- ) latest ON l.user_id = latest.user_id AND l.recorded_at = latest.max_rec
-- JOIN users u ON l.user_id = u.id;

-- ── 5.2  All active SOS alerts with user details (admin dashboard) ───────────
-- SELECT s.*, u.name AS user_name, u.phone AS user_phone
-- FROM sos_alerts s
-- JOIN users u ON s.user_id = u.id
-- WHERE s.status = 'active'
-- ORDER BY s.created_at DESC;

-- ── 5.3  Risk assessment history for a tourist ───────────────────────────────
-- SELECT * FROM risk_logs WHERE user_id = 2 ORDER BY created_at DESC LIMIT 50;

-- ── 5.4  Admin analytics summary ─────────────────────────────────────────────
-- SELECT COUNT(*) AS totalUsers  FROM users       WHERE role = 'tourist';
-- SELECT COUNT(*) AS totalTrips  FROM trips;
-- SELECT COUNT(*) AS activeSOS   FROM sos_alerts  WHERE status = 'active';
-- SELECT COUNT(*) AS highRisk    FROM risk_logs    WHERE risk_level = 'high';
-- SELECT risk_level, COUNT(*) AS count FROM risk_logs GROUP BY risk_level;

-- ── 5.5  Tourists currently in a danger geofence ─────────────────────────────
-- SELECT ga.user_id, u.name, g.name AS zone, ga.recorded_at
-- FROM geofence_alerts ga
-- JOIN geofences g  ON ga.geofence_id = g.id
-- JOIN users u      ON ga.user_id     = u.id
-- WHERE g.type = 'danger' AND ga.action = 'entered'
-- ORDER BY ga.recorded_at DESC;

-- ── 5.6  Overdue check-in users (admin welfare view) ─────────────────────────
-- SELECT c.*, u.name, u.email, u.phone
-- FROM checkin_timers c
-- JOIN users u ON c.user_id = u.id
-- WHERE c.status = 'overdue'
-- ORDER BY c.next_checkin_at ASC;

-- ── 5.7  Risk heatmap data (latitude/longitude + score for map overlay) ───────
-- SELECT id, user_id, location_name, latitude, longitude, risk_score, risk_level, created_at
-- FROM risk_logs
-- WHERE latitude IS NOT NULL AND longitude IS NOT NULL
-- ORDER BY created_at DESC
-- LIMIT 500;
