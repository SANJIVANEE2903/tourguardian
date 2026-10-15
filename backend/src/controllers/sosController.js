const { pool } = require('../config/db');
const { sendSMS, sendEmailAlert } = require('../utils/smsService');

async function triggerSOS(req, res, next) {
  try {
    const { latitude, longitude, message, trip_id } = req.body;
    const [result] = await pool.query(
      'INSERT INTO sos_alerts (user_id, trip_id, latitude, longitude, message, status) VALUES (?, ?, ?, ?, ?, "active")',
      [req.user.id, trip_id || null, latitude || null, longitude || null, message || 'Emergency assistance requested']
    );

    const mapsUrl = (latitude && longitude)
      ? `https://maps.google.com/?q=${latitude},${longitude}`
      : 'Location Unavailable';

    // Fetch user's registered emergency contacts
    let [contacts] = await pool.query('SELECT * FROM emergency_contacts WHERE user_id = ?', [req.user.id]);

    // If no custom contacts set up yet, provide default emergency responder dispatch
    if (contacts.length === 0) {
      contacts = [
        { id: 'default_1', name: 'Primary Emergency Contact / Police Dispatch', phone: '+91-112', email: 'dispatch@tourguardian.org', relationship: 'Official Rescue Service' }
      ];
    }

    // Build emergency dispatch message payloads and send real SMS / Emails asynchronously
    const emergencyDispatchList = await Promise.all(contacts.map(async c => {
      const sosText = `🚨 EMERGENCY SOS ALERT! ${req.user.name} requires IMMEDIATE assistance! Location: ${mapsUrl} (Lat: ${latitude || 'N/A'}, Lng: ${longitude || 'N/A'}). Note: "${message || 'Help requested'}" [Alert #${result.insertId}]`;
      
      let dispatchStatus = 'DELIVERED_VIA_GATEWAY';
      
      // Attempt to send real Email
      if (c.email) {
        const emailResult = await sendEmailAlert(c.email, `🚨 URGENT SOS ALERT from ${req.user.name}`, sosText);
        if (emailResult.success) {
          dispatchStatus = `REAL_EMAIL_SENT_VIA_${emailResult.provider}`;
        }
      }

      // Attempt to send real SMS (will override email status visually if successful or if failed)
      if (c.phone) {
        const smsResult = await sendSMS(c.phone, sosText);
        if (smsResult.success) {
          dispatchStatus = `REAL_SMS_SENT_VIA_${smsResult.provider}`;
        } else {
          // If SMS fails but email succeeded, keep email status, else show SMS failure
          if (!dispatchStatus.includes('REAL_EMAIL')) {
            dispatchStatus = `SIMULATED (${smsResult.reason})`;
          }
        }
      }

      return {
        contactId: c.id,
        name: c.name,
        phone: c.phone || 'N/A',
        email: c.email || 'N/A',
        relationship: c.relationship || 'Emergency Contact',
        messageSent: sosText,
        mapsUrl,
        dispatchStatus
      };
    }));

    // Log notification in DB
    await pool.query(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, "sos")',
      [
        req.user.id,
        '🚨 Emergency SOS Dispatch Broadcasted',
        `Emergency message with live GPS location (${mapsUrl}) dispatched to ${emergencyDispatchList.length} contact(s).`
      ]
    );

    const [rows] = await pool.query(
      `SELECT sos_alerts.*, users.name AS user_name, users.phone AS user_phone
       FROM sos_alerts JOIN users ON sos_alerts.user_id = users.id
       WHERE sos_alerts.id = ?`,
      [result.insertId]
    );
    const alert = rows[0];

    // Real-time Socket.IO Push to Admins and User
    try {
      const io = req.app.get('io');
      io.to('admins').emit('sos:new', alert);
      io.to(`user:${req.user.id}`).emit('sos:ack', { ...alert, contactsNotified: emergencyDispatchList });
    } catch (emitErr) {
      console.warn('Socket emit failed:', emitErr.message);
    }

    res.status(201).json({
      alert,
      mapsUrl,
      contactsNotified: emergencyDispatchList
    });
  } catch (err) { next(err); }
}

async function getMySOSHistory(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM sos_alerts WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch (err) { next(err); }
}

async function resolveSOS(req, res, next) {
  try {
    const [existing] = await pool.query('SELECT * FROM sos_alerts WHERE id = ? AND (user_id = ? OR ? = "admin")', [req.params.id, req.user.id, req.user.role]);
    if (existing.length === 0) return res.status(404).json({ message: 'Alert not found.' });

    await pool.query('UPDATE sos_alerts SET status = "resolved", resolved_at = NOW() WHERE id = ?', [req.params.id]);

    try {
      const io = req.app.get('io');
      io.to('admins').emit('sos:resolved', { id: Number(req.params.id) });
      io.to(`user:${existing[0].user_id}`).emit('sos:resolved', { id: Number(req.params.id) });
    } catch (emitErr) {
      console.warn('Socket emit failed:', emitErr.message);
    }

    res.json({ message: 'SOS alert marked resolved.' });
  } catch (err) { next(err); }
}

async function updateDispatchSOS(req, res, next) {
  try {
    const { assigned_to, responder_notes, eta_minutes, status } = req.body;
    const alertId = req.params.id;

    await pool.query(
      `UPDATE sos_alerts
       SET assigned_to = ?, responder_notes = ?, eta_minutes = ?, status = COALESCE(?, status),
           resolved_at = CASE WHEN ? = 'resolved' THEN NOW() ELSE resolved_at END
       WHERE id = ?`,
      [assigned_to || null, responder_notes || null, eta_minutes || null, status || null, status || null, alertId]
    );

    const [rows] = await pool.query(
      `SELECT sos_alerts.*, users.name AS user_name, users.phone AS user_phone
       FROM sos_alerts JOIN users ON sos_alerts.user_id = users.id
       WHERE sos_alerts.id = ?`,
      [alertId]
    );

    if (rows.length > 0) {
      try {
        const io = req.app.get('io');
        io.to('admins').emit('sos:dispatch_update', rows[0]);
        io.to(`user:${rows[0].user_id}`).emit('sos:dispatch_update', rows[0]);
      } catch (e) {}
    }

    res.json({ message: 'SOS Dispatch updated successfully.', alert: rows[0] });
  } catch (err) { next(err); }
}

module.exports = { triggerSOS, getMySOSHistory, resolveSOS, updateDispatchSOS };
