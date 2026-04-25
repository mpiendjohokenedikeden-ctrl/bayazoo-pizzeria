const User = require('./User');
const Pizza = require('./Pizza');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Message = require('./Message');
const Horaire = require('./Horaire');
const RemiseEspeces = require('./RemiseEspeces');

// Associations
User.hasMany(Order, { foreignKey: 'clientId', as: 'commandes' });
Order.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

User.hasMany(Order, { foreignKey: 'livreurId', as: 'livraisons' });
Order.belongsTo(User, { foreignKey: 'livreurId', as: 'livreur' });

User.hasMany(Order, { foreignKey: 'receveurId', as: 'retraits' });
Order.belongsTo(User, { foreignKey: 'receveurId', as: 'receveur' });

Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'articles' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Pizza.hasMany(OrderItem, { foreignKey: 'pizzaId' });
OrderItem.belongsTo(Pizza, { foreignKey: 'pizzaId' });

Order.hasMany(Message, { foreignKey: 'orderId', as: 'messages' });
Message.belongsTo(Order, { foreignKey: 'orderId' });

User.hasMany(Message, { foreignKey: 'senderId', as: 'messagesenvoyes' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'expediteur' });

User.hasMany(RemiseEspeces, { foreignKey: 'livreurId', as: 'remises' });
RemiseEspeces.belongsTo(User, { foreignKey: 'livreurId', as: 'livreur' });

module.exports = {
  User, Pizza, Order, OrderItem, Message, Horaire, RemiseEspeces
};