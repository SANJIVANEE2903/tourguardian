const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const { listContacts, addContact, updateContact, deleteContact } = require('../controllers/contactController');
router.use(authenticate);
router.get('/', listContacts);
router.post('/', addContact);
router.put('/:id', updateContact);
router.delete('/:id', deleteContact);
module.exports = router;
