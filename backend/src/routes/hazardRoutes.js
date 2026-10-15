const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { createHazard, getHazards } = require('../controllers/hazardController');

router.use(authenticate);
router.post('/', createHazard);
router.get('/', getHazards);

module.exports = router;
