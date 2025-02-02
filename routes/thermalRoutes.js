const express = require('express');
const { uploadThermalData, getThermalReport, getTemperatureData } = require('../controllers/thermalController');
const router = express.Router();
const cors = require('cors');
const authMiddleware = require('../middleware/authMiddleware');

// Habilitar o CORS para todas as rotas
router.use(cors());

// Rota para fazer upload dos dados de temperatura
router.post('/upload-thermal-data', uploadThermalData);

// Rota para gerar relatório de temperatura
router.get('/report', authMiddleware, getThermalReport);

// Rota para obter os dados de temperatura
router.get('/get-temperature-data', authMiddleware, getTemperatureData);

module.exports = router;