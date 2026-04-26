const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Horaire = sequelize.define('Horaire', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  jour: {
    type: DataTypes.ENUM('lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'),
    allowNull: false,
  },
  ouvert: { type: DataTypes.BOOLEAN, defaultValue: true },
  heureOuverture: { type: DataTypes.STRING, defaultValue: '08:00' },
  heureFermeture: { type: DataTypes.STRING, defaultValue: '22:00' },
}, { tableName: 'horaires' });

module.exports = Horaire;