const express = require('express');
const router = express.Router();
const horaireController = require('../controllers/horaireController');
const auth = require('../middleware/auth');

router.get('/', horaireController.getHoraires);
router.get('/statut', horaireController.getStatut);
router.put('/:jour', auth, horaireController.modifierHoraire);

module.exports = router;