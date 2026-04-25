const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  codeCommande: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  codeQR: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  statut: {
    type: DataTypes.ENUM(
      'en_attente',
      'en_preparation',
      'pret',
      'en_livraison',
      'livre',
      'paye',
      'remis_client',
      'en_attente_paiement',
      'annule'
    ),
    defaultValue: 'en_attente',
  },
  modeReception: {
    type: DataTypes.ENUM('livraison', 'retrait'),
    allowNull: false,
  },
  modePaiement: {
    type: DataTypes.ENUM('airtel_money', 'moov_money', 'especes'),
    allowNull: false,
  },
  total: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  couponApplique: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  livreurId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  receveurId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

module.exports = Order;