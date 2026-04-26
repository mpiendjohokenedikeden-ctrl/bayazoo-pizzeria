const admin = require('firebase-admin');
const serviceAccount = require('../firebase-admin.json');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Envoyer une notification à un utilisateur
const envoyerNotification = async (fcmToken, titre, corps, data = {}) => {
  if (!fcmToken) return;
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: {
        title: titre,
        body: corps,
      },
      data,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
    });
    console.log(`✅ Notification envoyée: ${titre}`);
  } catch (err) {
    console.error('❌ Erreur notification:', err.message);
  }
};

module.exports = { envoyerNotification };