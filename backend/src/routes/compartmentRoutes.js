const router = require('express').Router();
const compartmentController = require('../controllers/compartmentController');

router.get('/', compartmentController.list);
router.get('/lockers/:lockerId/compartments', compartmentController.getCompartmentsByLocker);
router.post('/toggle-status', compartmentController.toggleStatus);
router.post('/padronizar-status', compartmentController.padronizarStatus);
router.post('/padronizar-bloqueados', compartmentController.padronizarBloqueados);

module.exports = router;
