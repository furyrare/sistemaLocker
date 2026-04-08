const router = require('express').Router();
const analyticsController = require('../controllers/analyticsController');

router.get('/entregas', analyticsController.getAnalytics);

module.exports = router;
