const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getGeofences, createGeofence, deleteGeofence } = require('../controllers/geofenceController');

router.use(authenticate);
router.get('/', getGeofences);
router.post('/', requireAdmin, createGeofence);
router.delete('/:id', requireAdmin, deleteGeofence);

module.exports = router;
