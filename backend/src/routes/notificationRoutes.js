const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { list, markRead, markAllRead } = require('../controllers/notificationController');
router.use(authenticate);
router.get('/', list);
router.put('/:id/read', markRead);
router.put('/read-all', markAllRead);
module.exports = router;
