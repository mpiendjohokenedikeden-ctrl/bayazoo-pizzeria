const express = require('express');
const router = express.Router();
const equipeController = require('../controllers/equipeController');
const auth = require('../middleware/auth');

router.get('/', auth, equipeController.listerEquipe);
router.post('/', auth, equipeController.ajouterMembre);
router.put('/:id', auth, equipeController.modifierMembre);
router.delete('/:id', auth, equipeController.supprimerMembre);

module.exports = router;