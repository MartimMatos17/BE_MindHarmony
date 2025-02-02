const express = require('express');
const { uploadOxygenLevel, getOxygenLevelReport, getOxygenData } = require('../controllers/oxygenLevelController');
const router = express.Router();
const cors = require('cors');
const authMiddleware = require('../middleware/authMiddleware.js');

// Habilitar o CORS para todas as rotas
router.use(cors());

// Rota para fazer upload dos dados de saturação de oxigênio
router.post('/upload-oxygen-level', authMiddleware, uploadOxygenLevel);

// Rota para obter os dados de saturação de oxigénio
router.get('/get-oxygen-data', authMiddleware, getOxygenData);

// Rota para gerar relatório de saturação de oxigênio
router.get('/report', authMiddleware, getOxygenLevelReport);

module.exports = router;