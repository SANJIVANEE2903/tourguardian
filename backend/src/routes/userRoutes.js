const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { getProfile, updateProfile, getSafetyHistory } = require('../controllers/userController');
router.use(authenticate);
router.get('/me', getProfile);
router.put('/me', updateProfile);
router.get('/me/safety-history', getSafetyHistory);
module.exports = router;
