const { Horaire } = require('../models/index');

const JOURS = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];

// INITIALISER LES HORAIRES (si pas encore créés)
const initialiserHoraires = async () => {
  for (const jour of JOURS) {
    await Horaire.findOrCreate({
      where: { jour },
      defaults: {
        ouvert: true,
        heureOuverture: '08:00',
        heureFermeture: '22:00',
      },
    });
  }
};

// GET TOUS LES HORAIRES
exports.getHoraires = async (req, res) => {
  try {
    await initialiserHoraires();
    const horaires = await Horaire.findAll();
    res.json(horaires);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// GET STATUT OUVERT/FERMÉ
exports.getStatut = async (req, res) => {
  try {
    await initialiserHoraires();

    const jours = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
    const now = new Date();
    const jourActuel = jours[now.getDay()];
    const heureActuelle = now.getHours() * 60 + now.getMinutes();

    const horaire = await Horaire.findOne({ where: { jour: jourActuel } });

    if (!horaire || !horaire.ouvert) {
      return res.json({ ouvert: false, message: 'Pizzeria fermée aujourd\'hui' });
    }

    const [hO, mO] = horaire.heureOuverture.split(':').map(Number);
    const [hF, mF] = horaire.heureFermeture.split(':').map(Number);
    const ouverture = hO * 60 + mO;
    const fermeture = hF * 60 + mF;

    const ouvert = heureActuelle >= ouverture && heureActuelle < fermeture;

    res.json({
      ouvert,
      heureOuverture: horaire.heureOuverture,
      heureFermeture: horaire.heureFermeture,
      jourActuel,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};

// MODIFIER UN HORAIRE
exports.modifierHoraire = async (req, res) => {
  try {
    const { jour } = req.params;
    const { ouvert, heureOuverture, heureFermeture } = req.body;

    const horaire = await Horaire.findOne({ where: { jour } });
    if (!horaire) return res.status(404).json({ message: 'Horaire introuvable' });

    await horaire.update({ ouvert, heureOuverture, heureFermeture });
    res.json({ message: 'Horaire mis à jour', horaire });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', erreur: err.message });
  }
};