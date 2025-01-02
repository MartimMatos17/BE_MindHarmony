const express = require('express');
const { uploadThermalData, getThermalReport } = require('../controllers/thermalController');
const router = express.Router();

// Rota para guardar dados de temperatura corporal
router.post('/upload-thermal-data', uploadThermalData);

// Rota para gerar relatório de temperatura corporal
router.get('/report/:userId', getThermalReport);

module.exports = router;
