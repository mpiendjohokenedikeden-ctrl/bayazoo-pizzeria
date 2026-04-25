const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');

router.post('/', auth, orderController.creerCommande);
router.get('/mes-commandes', auth, orderController.mesCommandes);
router.get('/all', auth, orderController.toutesLesCommandes);
router.get('/receveur', auth, orderController.commandesReceveur);
router.get('/livreur', auth, orderController.commandesLivreur);
router.get('/disponibles-livreur', auth, orderController.commandesDisponiblesLivreur);
router.put('/:id/prendre', auth, orderController.prendreCommande);
router.put('/:id/prendre-livraison', auth, orderController.prendreLivraison);
router.put('/:id/statut', auth, orderController.changerStatut);
router.put('/:id/assigner-livreur', auth, orderController.assignerLivreur);
router.get('/valider/:code', auth, orderController.validerQRCode);
router.put('/:id/valider-especes', auth, orderController.validerEspeces);
router.delete('/:id', auth, orderController.supprimerCommande);

module.exports = router;