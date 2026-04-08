const router = require('express').Router();
const deliveriesManageController = require('../controllers/deliveriesManageController');

router.get('/', deliveriesManageController.list);
router.delete('/:id', deliveriesManageController.deleteDelivery);

module.exports = router;
