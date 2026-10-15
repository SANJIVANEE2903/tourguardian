const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getBroadcasts, createBroadcast } = require('../controllers/broadcastController');

router.use(authenticate);
router.get('/', getBroadcasts);
router.post('/', requireAdmin, createBroadcast);

module.exports = router;
