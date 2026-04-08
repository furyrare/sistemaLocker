const router = require('express').Router();
const reportController = require('../controllers/reportController');

router.get('/deliveries', reportController.getDeliveryReport);
router.get('/deliveries/export', reportController.exportDeliveryReport);
router.get('/lockers', reportController.getLockerReport);
router.get('/summary', reportController.getSummaryReport);

module.exports = router;
