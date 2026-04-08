const router = require('express').Router();
const lockersManageController = require('../controllers/lockersManageController');

router.get('/', lockersManageController.getAllLockers);
router.get('/:id', lockersManageController.getLockerById);
router.post('/', lockersManageController.createLocker);
router.put('/:id', lockersManageController.updateLocker);
router.delete('/:id', lockersManageController.deleteLocker);

module.exports = router;
