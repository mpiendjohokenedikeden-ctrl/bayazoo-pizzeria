const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User } = require('../models/index');
require('dotenv').config();

const genererCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const genererToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, nom: user.nom, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

// Transporter email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// INSCRIPTION
exports.inscription = async (req, res) => {
  try {
    const { nom, email, motDePasse, telephone } = req.body;

    if (!nom || !email || !motDePasse || !telephone) {
      return res.status(400).json({
        message: 'Tous les champs sont obligatoires',
      });
    }

    if (!telephone.startsWith('+241')) {
      return res.status(400).json({
        message: 'Le numéro doit commencer par +241',
      });
    }

    const existe = await User.findOne({ where: { email } });
    if (existe) {
      return res
        .status(400)
        .json({ message: 'Email déjà utilisé' });
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    const user = await User.create({
      nom, email, motDePasse: hash, telephone, role: 'client',
    });

    const token = genererToken(user);

    res.status(201).json({
      message: 'Compte créé avec succès',
      token,
      user: {
        id: user.id, nom: user.nom, email: user.email,
        telephone: user.telephone, role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// CONNEXION
exports.connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    const valide = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!valide) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    const token = genererToken(user);

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id, nom: user.nom, email: user.email,
        telephone: user.telephone, role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// MODIFIER PROFIL
exports.modifierProfil = async (req, res) => {
  try {
    const { nom, email, telephone } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (telephone && !telephone.startsWith('+241')) {
      return res.status(400).json({
        message: 'Le numéro doit commencer par +241',
      });
    }

    await user.update({ nom, email, telephone });
    res.json({ message: 'Profil mis à jour', user });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// MODIFIER MOT DE PASSE
exports.modifierMotDePasse = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;
    const user = await User.findByPk(req.user.id);

    const valide = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!valide) {
      return res.status(401).json({
        message: 'Ancien mot de passe incorrect',
      });
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, 10);
    await user.update({ motDePasse: hash });

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// ENVOYER CODE REINITIALISATION — avec email réel
exports.envoyerCodeReinit = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Email introuvable' });
    }

    const code = genererCode();
    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await user.update({ resetCode: code, resetCodeExpiry: expiry });

    // Email HTML
    const mailOptions = {
      from: `"Le BAYAZOO 🍕" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe — Le BAYAZOO',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; background: #FAF9F7; margin: 0; padding: 20px; }
            .container { max-width: 480px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
            .header { background: #E63946; padding: 32px 24px; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px; }
            .body { padding: 32px 24px; }
            .code-box { background: #1A1A1A; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
            .code { color: #E63946; font-size: 40px; font-weight: bold; letter-spacing: 10px; font-family: monospace; }
            .info { color: #666; font-size: 13px; line-height: 1.6; }
            .warning { background: #FFF3CD; border: 1px solid #FFD700; border-radius: 8px; padding: 12px 16px; margin-top: 20px; font-size: 12px; color: #856404; }
            .footer { background: #FAF9F7; padding: 16px 24px; text-align: center; font-size: 11px; color: #999; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍕 Le BAYAZOO</h1>
              <p>Pizzeria · Libreville, Gabon</p>
            </div>
            <div class="body">
              <p style="font-size:16px; color:#1A1A1A;">Bonjour <strong>${user.nom}</strong>,</p>
              <p class="info">Vous avez demandé la réinitialisation de votre mot de passe. Voici votre code de vérification :</p>
              
              <div class="code-box">
                <div class="code">${code}</div>
              </div>

              <p class="info">Entrez ce code dans l'application pour créer un nouveau mot de passe.</p>
              
              <div class="warning">
                ⚠️ Ce code est valable <strong>15 minutes</strong> seulement. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </div>
            </div>
            <div class="footer">
              © ${new Date().getFullYear()} Le BAYAZOO — Libreville, Gabon<br>
              Cet email a été envoyé automatiquement, ne pas répondre.
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log(`📧 Code réinit envoyé à ${email}: ${code}`);

    res.json({ message: 'Code envoyé à votre email' });
  } catch (err) {
    console.error('Erreur envoi email:', err);
    res.status(500).json({ message: 'Erreur envoi email', erreur: err.message });
  }
};

// REINITIALISER MOT DE PASSE
exports.reinitialiserMotDePasse = async (req, res) => {
  try {
    const { email, code, nouveauMotDePasse } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    if (user.resetCode !== code) {
      return res.status(400).json({ message: 'Code incorrect' });
    }

    if (new Date() > user.resetCodeExpiry) {
      return res.status(400).json({ message: 'Code expiré' });
    }

    const hash = await bcrypt.hash(nouveauMotDePasse, 10);
    await user.update({
      motDePasse: hash,
      resetCode: null,
      resetCodeExpiry: null,
    });

    res.json({ message: 'Mot de passe réinitialisé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};