const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/inscription', authController.inscription);
router.post('/connexion', authController.connexion);
router.post('/envoyer-code-reinit', authController.envoyerCodeReinit);
router.post('/reinitialiser-mot-de-passe', authController.reinitialiserMotDePasse);
router.put('/modifier-profil', auth, authController.modifierProfil);
router.put('/modifier-mot-de-passe', auth, authController.modifierMotDePasse);

// Profil frais depuis le serveur
router.get('/profil', auth, async (req, res) => {
  try {
    const { User } = require('../models/index');
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['motDePasse'] },
    });
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
});

// Sauvegarder token FCM
router.put('/fcm-token', auth, async (req, res) => {
  try {
    const { User } = require('../models/index');
    const { fcmToken } = req.body;
    await User.update(
      { fcmToken },
      { where: { id: req.user.id } }
    );
    res.json({ message: 'Token FCM sauvegardé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;