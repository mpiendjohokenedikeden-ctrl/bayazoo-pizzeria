const bcrypt = require('bcryptjs');
const sequelize = require('./config/database');
const { User } = require('./models/index');

async function createAdmin() {
  await sequelize.authenticate();
  await sequelize.sync({ alter: true });

  const hash = await bcrypt.hash('admin123', 10);

  const admin = await User.findOrCreate({
    where: { email: 'admin@bayazoo.com' },
    defaults: {
      nom: 'Admin BAYAZOO',
      email: 'admin@bayazoo.com',
      motDePasse: hash,
      telephone: '+24101234567',
      role: 'admin',
    },
  });

  console.log('✅ Admin créé :', admin[0].email);
  process.exit();
}

createAdmin();