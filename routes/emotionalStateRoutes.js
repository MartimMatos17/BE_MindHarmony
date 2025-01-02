const express = require('express');
const { uploadEmotionalData, getEmotionalReport } = require('../controllers/emotionalStateController');
const router = express.Router();

// Rota para guardar dados emocionais
router.post('/upload-emotional-data', uploadEmotionalData);

// Rota para gerar relatório emocional
router.get('/report/:userId', getEmotionalReport);

module.exports = router;
