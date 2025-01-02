const express = require('express');
const router = express.Router();
const Location = require('../models/Location'); // Modelo de Localização

// Rota para salvar a localização do usuário
router.post('/location', async (req, res) => {
  const { name, email, latitude, longitude } = req.body;

  if (!name || !email || !latitude || !longitude) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    const newLocation = new Location({ name, email, latitude, longitude });
    await newLocation.save();
    return res.status(200).json({ message: 'Localização salva com sucesso!', data: newLocation });
  } catch (error) {
    console.error('Erro ao salvar localização:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Rota para buscar localizações de amigos
router.get('/friends-locations', async (req, res) => {
  try {
    const locations = await Location.find(); // Busca todas as localizações
    return res.status(200).json(locations);
  } catch (error) {
    console.error('Erro ao buscar localizações:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

module.exports = router;
