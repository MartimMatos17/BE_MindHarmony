const express = require('express');
const { uploadHeartRate, getHeartRateReport } = require('../controllers/heartRateController');
const router = express.Router();

// Rota para fazer upload dos dados de frequência cardíaca
router.post('/upload-heart-rate', uploadHeartRate);

// Rota para gerar relatório de frequência cardíaca
router.get('/report/:userId', getHeartRateReport);

module.exports = router;
