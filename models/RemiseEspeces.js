const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RemiseEspeces = sequelize.define('RemiseEspeces', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  montant: { type: DataTypes.INTEGER, allowNull: false },
  statut: { type: DataTypes.ENUM('en_attente', 'confirmee'), defaultValue: 'en_attente' },
  livreurId: { type: DataTypes.INTEGER, allowNull: false },
  confirmeAt: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'remiseespeces' });

module.exports = RemiseEspeces;