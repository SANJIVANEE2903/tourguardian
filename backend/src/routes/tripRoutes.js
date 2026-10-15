const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { createTrip, getTrips, getTripById, updateTrip, checkTripWeather, deleteTrip } = require('../controllers/tripController');
router.use(authenticate);
router.post('/', createTrip);
router.get('/', getTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.post('/:id/check-weather', checkTripWeather);
router.delete('/:id', deleteTrip);
module.exports = router;

