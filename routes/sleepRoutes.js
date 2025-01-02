const express = require('express');
const { uploadSleepData, getSleepReport } = require('../controllers/sleepController');
const router = express.Router();

// Rota para guardar dados de sono
router.post('/upload-sleep-data', uploadSleepData);

// Rota para gerar relatório de sono
router.get('/report/:userId', getSleepReport);

module.exports = router;
