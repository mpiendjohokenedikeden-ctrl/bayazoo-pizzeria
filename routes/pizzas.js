const express = require('express');
const router = express.Router();
const pizzaController = require('../controllers/pizzaController');
const auth = require('../middleware/auth');

router.get('/', pizzaController.listerPizzas);
router.get('/admin', auth, pizzaController.listerPizzasAdmin);
router.post('/', auth, pizzaController.ajouterPizza);
router.put('/:id', auth, pizzaController.modifierPizza);
router.delete('/:id', auth, pizzaController.supprimerPizza);

module.exports = router;