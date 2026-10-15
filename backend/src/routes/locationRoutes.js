const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { updateLocation, getLiveLocation, getLocationHistory } = require('../controllers/locationController');
router.use(authenticate);
router.post('/', updateLocation);
router.get('/history', getLocationHistory);
router.get('/:userId?', getLiveLocation);
module.exports = router;
