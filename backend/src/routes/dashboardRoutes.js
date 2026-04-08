const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/summary', dashboardController.getSummary);
router.get('/grid', dashboardController.getGrid);

module.exports = router;
