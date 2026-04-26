const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  motDePasse: { type: DataTypes.STRING, allowNull: false },
  telephone: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('client', 'livreur', 'receveur', 'admin'), defaultValue: 'client' },
  couponsDisponibles: { type: DataTypes.INTEGER, defaultValue: 0 },
  commandesPayees: { type: DataTypes.INTEGER, defaultValue: 0 },
  couponUtilise: { type: DataTypes.INTEGER, defaultValue: 0 },
  resetCode: { type: DataTypes.STRING, allowNull: true },
  resetCodeExpiry: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'users' });

module.exports = User;