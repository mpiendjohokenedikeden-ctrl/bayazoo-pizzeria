const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// IMPORTANT: routes fixes AVANT les routes avec paramètres
router.get('/non-lus/count', auth, chatController.messagesNonLus);

router.get('/:orderId', auth, chatController.getMessages);
router.post('/:orderId', auth, chatController.envoyerMessage);

module.exports = router;