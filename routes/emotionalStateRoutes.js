const express = require('express');
const { uploadEmotionalData, getEmotionalReport, getEmotionData } = require('../controllers/emotionalStateController');
const router = express.Router();
const cors = require('cors');
const authMiddleware = require('../middleware/authMiddleware.js');


router.use(cors());
// Rota para guardar dados emocionais
router.post('/upload-emotional-data', uploadEmotionalData);

// Rota para gerar relatório emocional
router.get('/report', authMiddleware, getEmotionalReport);

// Rota para obter os dados de estado emocional
router.get('/get-emotion-data', authMiddleware, getEmotionData);

module.exports = router;