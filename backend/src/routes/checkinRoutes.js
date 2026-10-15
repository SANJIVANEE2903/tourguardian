const router = require('express').Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getCheckinStatus, setCheckinTimer, recordCheckin, getOverdueCheckins } = require('../controllers/checkinController');

router.use(authenticate);
router.get('/', getCheckinStatus);
router.post('/timer', setCheckinTimer);
router.post('/ping', recordCheckin);
router.get('/overdue', requireAdmin, getOverdueCheckins);

module.exports = router;
