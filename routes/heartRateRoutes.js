const express = require('express');
const { uploadHeartRate, getHeartRateReport, getBPMData } = require('../controllers/heartRateController');
const router = express.Router();
const cors = require('cors');
const authMiddleware = require('../middleware/authMiddleware.js'); // Caminho corrigido

// Habilitar o CORS para todas as rotas
router.use(cors());

// Rota para fazer upload dos dados de frequência cardíaca
router.post('/upload-heart-rate', uploadHeartRate);

// Rota para gerar relatório de frequência cardíaca
router.get('/report', authMiddleware, getHeartRateReport);

// Rota para obter os dados de frequência cardíaca
router.get('/get-bpm-data', authMiddleware, getBPMData);

module.exports = router;