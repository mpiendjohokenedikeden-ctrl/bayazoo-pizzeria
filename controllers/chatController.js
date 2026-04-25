const { Message, User, Order } = require('../models/index');
const { Op } = require('sequelize');

// Trouver ou créer une conversation entre client et livreur
const getConversationId = async (orderId, userId) => {
  const order = await Order.findByPk(orderId);
  if (!order) return null;
  return { clientId: order.clientId, livreurId: order.livreurId };
};

// RÉCUPÉRER LES MESSAGES D'UNE COMMANDE
// Maintenant basé sur clientId + livreurId pour regrouper toutes
// les commandes du même client avec le même livreur
exports.getMessages = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable' });
    }

    const { clientId, livreurId } = order;

    // Si pas encore de livreur assigné, retourner tableau vide
    if (!livreurId) return res.json([]);

    // Trouver toutes les commandes entre ce client et ce livreur
    const commandes = await Order.findAll({
      where: { clientId, livreurId },
      attributes: ['id'],
    });
    const orderIds = commandes.map((c) => c.id);

    // Récupérer tous les messages de ces commandes
    const messages = await Message.findAll({
      where: { orderId: { [Op.in]: orderIds } },
      include: [
        {
          model: User,
          as: 'expediteur',
          attributes: ['id', 'nom', 'role'],
        },
      ],
      order: [['createdAt', 'ASC']],
    });

    // Marquer comme lus les messages pas envoyés par moi
    await Message.update(
      { lu: true },
      {
        where: {
          orderId: { [Op.in]: orderIds },
          senderId: { [Op.ne]: req.user.id },
          lu: false,
        },
      }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ENVOYER UN MESSAGE
exports.envoyerMessage = async (req, res) => {
  try {
    const { contenu } = req.body;

    if (!contenu || contenu.trim() === '') {
      return res.status(400).json({ message: 'Message vide' });
    }

    // On garde orderId pour savoir à quelle commande le message appartient
    // mais la lecture regroupera par client+livreur
    const message = await Message.create({
      orderId: req.params.orderId,
      senderId: req.user.id,
      senderRole: req.user.role,
      contenu: contenu.trim(),
      lu: false,
    });

    const messageComplet = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'expediteur',
          attributes: ['id', 'nom', 'role'],
        },
      ],
    });

    res.status(201).json(messageComplet);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// COMPTER MESSAGES NON LUS
exports.messagesNonLus = async (req, res) => {
  try {
    let whereOrder = {};
    if (req.user.role === 'client') whereOrder = { clientId: req.user.id };
    if (req.user.role === 'livreur') whereOrder = { livreurId: req.user.id };

    const commandes = await Order.findAll({ where: whereOrder });
    const orderIds = commandes.map((c) => c.id);

    const count = await Message.count({
      where: {
        orderId: { [Op.in]: orderIds },
        senderId: { [Op.ne]: req.user.id },
        lu: false,
      },
    });

    res.json({ nonLus: count });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};