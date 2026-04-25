const { Order, OrderItem, User } = require('../models/index');
const { Op } = require('sequelize');

const genererCodeQR = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'PAY-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const genererCodeCommande = async () => {
  const count = await Order.count();
  return `AZ-${count + 1}`;
};

exports.creerCommande = async (req, res) => {
  try {
    const {
      articles, modeReception, modePaiement,
      adresse, latitude, longitude, couponApplique,
    } = req.body;

    if (!articles || articles.length === 0) {
      return res.status(400).json({ message: 'Panier vide' });
    }

    let total = 0;
    for (const article of articles) {
      total += article.prix * article.quantite;
    }

    const client = await User.findByPk(req.user.id);

    if (couponApplique) {
      const commandesPayees = await Order.count({
        where: {
          clientId: req.user.id,
          statut: { [Op.in]: ['paye', 'remis_client'] },
        },
      });
      const couponsGeneres = Math.floor(commandesPayees / 5);
      const couponsUtilises = client.couponUtilise || 0;
      const couponsDispos = couponsGeneres - couponsUtilises;

      if (couponsDispos <= 0) {
        return res.status(400).json({ message: 'Aucun coupon disponible' });
      }

      total = Math.floor(total * 0.95);
      const nouveauCouponUtilise = couponsUtilises + 1;
      const nouveauCouponsDispos = couponsGeneres - nouveauCouponUtilise;

      await client.update({
        couponUtilise: nouveauCouponUtilise,
        couponsDisponibles: Math.max(0, nouveauCouponsDispos),
      });
    }

    const codeCommande = await genererCodeCommande();
    const codeQR = genererCodeQR();

    const order = await Order.create({
      codeCommande,
      codeQR,
      statut: 'en_attente',
      modeReception,
      modePaiement,
      total,
      adresse: adresse || null,
      latitude: latitude || null,
      longitude: longitude || null,
      couponApplique: !!couponApplique,
      clientId: req.user.id,
    });

    for (const article of articles) {
      await OrderItem.create({
        orderId: order.id,
        pizzaId: article.pizzaId,
        nom: article.nom,
        prix: article.prix,
        quantite: article.quantite,
      });
    }

    const orderComplete = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'articles' }],
    });

    res.status(201).json({
      message: 'Commande créée',
      commande: orderComplete.toJSON(),
    });
  } catch (err) {
    console.error('❌ ERREUR COMMANDE:', err);
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.mesCommandes = async (req, res) => {
  try {
    const commandes = await Order.findAll({
      where: { clientId: req.user.id },
      include: [{ model: OrderItem, as: 'articles' }],
      order: [['createdAt', 'ASC']],
    });
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.toutesLesCommandes = async (req, res) => {
  try {
    const commandes = await Order.findAll({
      include: [
        { model: OrderItem, as: 'articles' },
        { model: User, as: 'client', attributes: ['id', 'nom', 'email', 'telephone'] },
        { model: User, as: 'livreur', attributes: ['id', 'nom', 'telephone'] },
        { model: User, as: 'receveur', attributes: ['id', 'nom'] },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.commandesReceveur = async (req, res) => {
  try {
    const commandes = await Order.findAll({
      include: [
        { model: OrderItem, as: 'articles' },
        { model: User, as: 'client', attributes: ['id', 'nom', 'telephone'] },
        { model: User, as: 'livreur', attributes: ['id', 'nom'] },
      ],
      // Plus anciennes en premier
      order: [['createdAt', 'ASC']],
    });
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.prendreCommande = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    if (order.statut !== 'en_attente') {
      return res.status(400).json({ message: 'Commande déjà prise' });
    }

    await order.update({
      statut: 'en_preparation',
      receveurId: req.user.id,
    });

    res.json({ message: 'Commande prise en charge', commande: order });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.commandesDisponiblesLivreur = async (req, res) => {
  try {
    const commandes = await Order.findAll({
      where: {
        statut: 'pret',
        modeReception: 'livraison',
        livreurId: null,
      },
      include: [
        { model: OrderItem, as: 'articles' },
        { model: User, as: 'client', attributes: ['id', 'nom', 'telephone'] },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.prendreLivraison = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    if (order.livreurId !== null) {
      return res.status(400).json({ message: 'Commande déjà prise par un livreur' });
    }

    await order.update({
      livreurId: req.user.id,
      statut: 'en_livraison',
    });

    res.json({ message: 'Livraison prise en charge', commande: order });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.commandesLivreur = async (req, res) => {
  try {
    const commandes = await Order.findAll({
      where: { livreurId: req.user.id },
      include: [
        { model: OrderItem, as: 'articles' },
        { model: User, as: 'client', attributes: ['id', 'nom', 'telephone'] },
      ],
      order: [['createdAt', 'ASC']],
    });
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.changerStatut = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    await order.update({ statut: req.body.statut });
    res.json({ message: 'Statut mis à jour', commande: order });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.assignerLivreur = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    await order.update({
      livreurId: req.body.livreurId,
      statut: 'en_livraison',
    });

    res.json({ message: 'Livreur assigné', commande: order });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.validerQRCode = async (req, res) => {
  try {
    const { code } = req.params;

    const order = await Order.findOne({
      where: {
        [Op.or]: [
          { codeCommande: code },
          { codeQR: code },
        ],
      },
      include: [{ model: User, as: 'client', attributes: ['id', 'nom'] }],
    });

    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    if (req.user.role === 'livreur' && order.livreurId !== req.user.id) {
      return res.status(403).json({ message: "Vous n'êtes pas assigné à cette commande" });
    }

    await order.update({ statut: 'paye' });

    const client = await User.findByPk(order.clientId);
    const commandesPayees = await Order.count({
      where: {
        clientId: order.clientId,
        statut: { [Op.in]: ['paye', 'remis_client'] },
      },
    });
    const couponsGeneres = Math.floor(commandesPayees / 5);
    const couponsUtilises = client.couponUtilise || 0;
    const couponsDisponibles = Math.max(0, couponsGeneres - couponsUtilises);

    await client.update({ commandesPayees, couponsDisponibles });

    res.json({ message: 'Paiement validé', commande: order });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.validerEspeces = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    await order.update({ statut: 'paye' });

    const client = await User.findByPk(order.clientId);
    const commandesPayees = await Order.count({
      where: {
        clientId: order.clientId,
        statut: { [Op.in]: ['paye', 'remis_client'] },
      },
    });
    const couponsGeneres = Math.floor(commandesPayees / 5);
    const couponsUtilises = client.couponUtilise || 0;
    const couponsDisponibles = Math.max(0, couponsGeneres - couponsUtilises);

    await client.update({ commandesPayees, couponsDisponibles });

    res.json({ message: 'Paiement espèces validé', commande: order });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

exports.supprimerCommande = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Commande introuvable' });

    await order.destroy();
    res.json({ message: 'Commande supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};