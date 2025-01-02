const express = require('express');
const router = express.Router();

// Mock de dados dos amigos - substitua por conexão ao banco de dados, se necessário
const friends = [
  {
    name: 'Elton Lin',
    email: 'elton@example.com',
    latitude: 37.7749,
    longitude: -122.4194,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: 'Christine Huang',
    email: 'christine@example.com',
    latitude: 37.78825,
    longitude: -122.4324,
    image: 'https://via.placeholder.com/40',
  },
  {
    name: 'Orkun Kucuksevim',
    email: 'orkun@example.com',
    latitude: 37.7808,
    longitude: -122.4039,
    image: 'https://via.placeholder.com/40',
  },
];

// Rota para obter localizações dos amigos
router.get('/friends-locations', (req, res) => {
  res.json(friends);
});

module.exports = router;
