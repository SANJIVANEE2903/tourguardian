const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { assess, history } = require('../controllers/riskController');
router.use(authenticate);
router.post('/assess', assess);
router.get('/history', history);
module.exports = router;
