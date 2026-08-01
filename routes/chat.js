const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.get('/:orderId', auth, chatController.getMessages);
router.post('/:orderId', auth, chatController.envoyerMessage);
router.get('/non-lus/count', auth, chatController.messagesNonLus);

module.exports = router;