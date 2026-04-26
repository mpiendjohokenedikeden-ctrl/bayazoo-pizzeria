const admin = require('firebase-admin');

// Initialiser Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin initialisé');
  } catch (err) {
    console.error('❌ Erreur Firebase Admin:', err.message);
  }
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