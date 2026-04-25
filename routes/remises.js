const express = require('express');
const router = express.Router();
const remiseController = require('../controllers/remiseController');
const auth = require('../middleware/auth');

router.get('/solde', auth, remiseController.getSolde);
router.post('/demander', auth, remiseController.demanderRemise);
router.get('/en-attente', auth, remiseController.remisesEnAttente);
router.put('/:id/confirmer', auth, remiseController.confirmerRemise);
router.get('/historique/:livreurId', auth, remiseController.historiqueRemises);

module.exports = router;