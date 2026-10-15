const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { chat, history } = require('../controllers/chatbotController');
router.use(authenticate);
router.post('/', chat);
router.post('/chat', chat);
router.get('/history', history);
module.exports = router;
