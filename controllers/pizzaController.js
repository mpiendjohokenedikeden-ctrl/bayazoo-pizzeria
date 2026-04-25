const { Pizza } = require('../models/index');

exports.listerPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.findAll({
      where: { disponible: true },
    });
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur serveur',
      erreur: err.message,
    });
  }
};

exports.listerPizzasAdmin = async (req, res) => {
  try {
    const pizzas = await Pizza.findAll();
    res.json(pizzas);
  } catch (err) {
    res.status(500).json({
      message: 'Erreur serveur',
      erreur: err.message,
    });
  }
};

exports.ajouterPizza = async (req, res) => {
  try {
    const { nom, description, prix, image, disponible } =
        req.body;

    if (!nom || !prix) {
      return res
          .status(400)
          .json({ message: 'Nom et prix obligatoires' });
    }

    const pizza = await Pizza.create({
      nom,
      description,
      prix,
      image,
      disponible: disponible ?? true,
    });

    res.status(201).json({ message: 'Pizza ajoutée', pizza });
  } catch (err) {
    res.status(500).json({
      message: 'Erreur serveur',
      erreur: err.message,
    });
  }
};

exports.modifierPizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (!pizza)
      return res
          .status(404)
          .json({ message: 'Pizza introuvable' });

    const { nom, description, prix, image, disponible } =
        req.body;

    await pizza.update({
      nom,
      description,
      prix,
      image,
      disponible,
    });

    res.json({ message: 'Pizza modifiée', pizza });
  } catch (err) {
    res.status(500).json({
      message: 'Erreur serveur',
      erreur: err.message,
    });
  }
};

exports.supprimerPizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (!pizza)
      return res
          .status(404)
          .json({ message: 'Pizza introuvable' });

    await pizza.destroy();
    res.json({ message: 'Pizza supprimée' });
  } catch (err) {
    res.status(500).json({
      message: 'Erreur serveur',
      erreur: err.message,
    });
  }
};