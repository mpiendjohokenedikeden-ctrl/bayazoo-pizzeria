const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pizza = sequelize.define('Pizza', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  prix: { type: DataTypes.INTEGER, allowNull: false },
  image: { type: DataTypes.TEXT('long'), allowNull: true },
  disponible: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'pizzas' });

module.exports = Pizza;