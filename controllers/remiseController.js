const { RemiseEspeces, User, Order } = require('../models/index');

// SOLDE ESPÈCES DU LIVREUR
exports.getSolde = async (req, res) => {
  try {
    const { Op } = require('sequelize');

    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);
    const finJour = new Date();
    finJour.setHours(23, 59, 59, 999);

    // Espèces encaissées aujourd'hui seulement
    const commandes = await Order.findAll({
      where: {
        livreurId: req.user.id,
        modePaiement: 'especes',
        statut: { [Op.in]: ['paye', 'remis_client'] },
        createdAt: { [Op.between]: [debutJour, finJour] },
      },
    });
    const totalEncaisse = commandes.reduce(
      (sum, c) => sum + c.total, 0
    );

    // Remises confirmées aujourd'hui seulement
    const remises = await RemiseEspeces.findAll({
      where: {
        livreurId: req.user.id,
        statut: 'confirmee',
        createdAt: { [Op.between]: [debutJour, finJour] },
      },
    });
    const totalRemis = remises.reduce(
      (sum, r) => sum + r.montant, 0
    );

    // Solde = encaissé - remis (jamais négatif)
    const solde = Math.max(0, totalEncaisse - totalRemis);

    res.json({ solde, totalEncaisse, totalRemis });
  } catch (err) {
    res.status(500).json({
      message: 'Erreur serveur',
      erreur: err.message,
    });
  }
};

// DEMANDER UNE REMISE
exports.demanderRemise = async (req, res) => {
  try {
    const { montant } = req.body;

    if (!montant || montant <= 0) {
      return res.status(400).json({ message: 'Montant invalide' });
    }

    const remise = await RemiseEspeces.create({
      livreurId: req.user.id,
      montant,
      statut: 'en_attente',
    });

    res.status(201).json({ message: 'Demande de remise envoyée', remise });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// TOUTES LES REMISES EN ATTENTE (admin)
exports.remisesEnAttente = async (req, res) => {
  try {
    const remises = await RemiseEspeces.findAll({
      where: { statut: 'en_attente' },
      include: [
        { model: User, as: 'livreur', attributes: ['id', 'nom', 'telephone'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(remises);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// CONFIRMER UNE REMISE (admin)
exports.confirmerRemise = async (req, res) => {
  try {
    const remise = await RemiseEspeces.findByPk(req.params.id);
    if (!remise) return res.status(404).json({ message: 'Remise introuvable' });

    await remise.update({
      statut: 'confirmee',
      confirmeAt: new Date(),
    });

    res.json({ message: 'Remise confirmée', remise });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// HISTORIQUE REMISES D'UN LIVREUR
exports.historiqueRemises = async (req, res) => {
  try {
    const remises = await RemiseEspeces.findAll({
      where: { livreurId: req.params.livreurId },
      order: [['createdAt', 'DESC']],
    });
    res.json(remises);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};