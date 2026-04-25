const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
require('./models/index');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const pizzaRoutes = require('./routes/pizzas');
const orderRoutes = require('./routes/orders');
const chatRoutes = require('./routes/chat');
const horaireRoutes = require('./routes/horaires');
const remiseRoutes = require('./routes/remises');
const equipeRoutes = require('./routes/equipe');

app.use('/api/auth', authRoutes);
app.use('/api/pizzas', pizzaRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/horaires', horaireRoutes);
app.use('/api/remises', remiseRoutes);
app.use('/api/equipe', equipeRoutes);

app.get('/', (req, res) => {
  res.json({ message: '🍕 Le BAYAZOO API fonctionne !' });
});

sequelize.authenticate()
  .then(() => {
    console.log('✅ Base de données connectée');
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Erreur connexion DB :', err);
  });