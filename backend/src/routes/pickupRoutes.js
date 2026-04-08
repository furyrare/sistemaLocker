const router = require('express').Router();
const pickupController = require('../controllers/pickupController');

router.post('/verify', pickupController.verifyPickupCode);
router.post('/complete', pickupController.completePickup);
router.post('/', pickupController.pickupByCode); // Rota direta para o tablet

module.exports = router;
