const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getUsers, getTrips, getSOSAlerts, getAnalytics, getLatestLocations, getRiskHeatmap } = require('../controllers/adminController');
const { getHazards, deleteHazard } = require('../controllers/hazardController');

router.use(authenticate, requireAdmin);

router.get('/users', getUsers);
router.get('/trips', getTrips);
router.get('/sos-alerts', getSOSAlerts);
router.get('/analytics', getAnalytics);
router.get('/locations', getLatestLocations);
router.get('/risk-heatmap', getRiskHeatmap);
router.get('/hazards', getHazards);
router.delete('/hazards/:id', deleteHazard);

module.exports = router;


