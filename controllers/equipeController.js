const bcrypt = require('bcryptjs');
const { User } = require('../models/index');

// LISTE DE L'ÉQUIPE
exports.listerEquipe = async (req, res) => {
  try {
    const equipe = await User.findAll({
      where: {
        role: ['livreur', 'receveur'],
      },
      attributes: ['id', 'nom', 'email', 'telephone', 'role', 'createdAt'],
    });
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// AJOUTER UN MEMBRE
exports.ajouterMembre = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone, role } = req.body;

    if (!['livreur', 'receveur'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    if (!telephone.startsWith('+241')) {
      return res.status(400).json({ message: 'Le numéro doit commencer par +241' });
    }

    const existe = await User.findOne({ where: { email } });
    if (existe) return res.status(400).json({ message: 'Email déjà utilisé' });

    const hash = await bcrypt.hash(motDePasse, 10);

    const membre = await User.create({
      nom, email, motDePasse: hash, telephone, role,
    });

    res.status(201).json({
      message: 'Membre ajouté',
      membre: {
        id: membre.id,
        nom: membre.nom,
        email: membre.email,
        telephone: membre.telephone,
        role: membre.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// MODIFIER UN MEMBRE
exports.modifierMembre = async (req, res) => {
  try {
    const membre = await User.findByPk(req.params.id);
    if (!membre) {
      return res.status(404).json({ message: 'Membre introuvable' });
    }

    if (membre.role === 'admin') {
      return res.status(403).json({ message: 'Impossible de modifier un admin' });
    }

    const { nom, email, telephone, role, motDePasse } = req.body;

    // Vérifier si email déjà utilisé par un autre
    if (email && email !== membre.email) {
      const existe = await User.findOne({ where: { email } });
      if (existe) {
        return res.status(400).json({ message: 'Email déjà utilisé' });
      }
    }

    // Vérifier format téléphone si fourni
    if (telephone && !telephone.startsWith('+241')) {
      return res.status(400).json({
        message: 'Le numéro doit commencer par +241',
      });
    }

    const updates = {};
    if (nom) updates.nom = nom;
    if (email) updates.email = email;
    if (telephone) updates.telephone = telephone;
    if (role && ['livreur', 'receveur'].includes(role)) {
      updates.role = role;
    }

    // Nouveau mot de passe uniquement si fourni
    if (motDePasse && motDePasse.trim().length > 0) {
      updates.motDePasse = await bcrypt.hash(motDePasse, 10);
    }

    await membre.update(updates);

    res.json({
      message: 'Membre modifié',
      membre: {
        id: membre.id,
        nom: membre.nom,
        email: membre.email,
        telephone: membre.telephone,
        role: membre.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// SUPPRIMER UN MEMBRE
exports.supprimerMembre = async (req, res) => {
  try {
    const membre = await User.findByPk(req.params.id);
    if (!membre) {
      return res.status(404).json({ message: 'Membre introuvable' });
    }

    if (membre.role === 'admin') {
      return res.status(403).json({
        message: 'Impossible de supprimer un admin',
      });
    }

    await membre.destroy();
    res.json({ message: 'Membre supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};