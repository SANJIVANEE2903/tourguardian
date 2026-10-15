require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { testConnection } = require('./src/config/db');
const { notFound, errorHandler } = require('./src/middleware/errorHandler');
const { initSocket } = require('./src/socket');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const locationRoutes = require('./src/routes/locationRoutes');
const sosRoutes = require('./src/routes/sosRoutes');
const riskRoutes = require('./src/routes/riskRoutes');
const chatbotRoutes = require('./src/routes/chatbotRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const geofenceRoutes = require('./src/routes/geofenceRoutes');
const broadcastRoutes = require('./src/routes/broadcastRoutes');
const checkinRoutes = require('./src/routes/checkinRoutes');
const hazardRoutes = require('./src/routes/hazardRoutes');

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'TourGuardian API' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/emergency-contacts', contactRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/risk', riskRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/geofences', geofenceRoutes);
app.use('/api/broadcasts', broadcastRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/hazards', hazardRoutes);


app.use(notFound);
app.use(errorHandler);

// Wrap Express in a plain http.Server so Socket.IO can share the same port.
const httpServer = http.createServer(app);
const io = initSocket(httpServer);

// Make io available to any controller via req.app.get('io').
app.set('io', io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, async () => {
  console.log(`🚀 TourGuardian API running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO listening on the same port`);
  await testConnection();
});
// restart nodemon
