const express = require('express');
const {
  updateVibrationSettings,
  getVibrationSettings,
} = require('../controllers/vibrationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Obter configurações de vibração
router.get('/', authMiddleware, getVibrationSettings);

// Atualizar configurações de vibração
router.put('/', authMiddleware, updateVibrationSettings);

module.exports = router;
