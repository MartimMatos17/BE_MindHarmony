// routes/sleepRoutes.js
const express = require('express');
const { uploadSleepData, getSleepReport, getSleepData } = require('../controllers/sleepController');
const router = express.Router();
const cors = require('cors');
const authMiddleware = require('../middleware/authMiddleware.js');

router.use(cors());

// Rota para guardar dados de sono
router.post('/upload-sleep-data', authMiddleware, uploadSleepData);

// Rota para obter os dados de sono
router.get('/get-sleep-data', authMiddleware, getSleepData);

// Rota para gerar relatório de sono
router.get('/report', authMiddleware, getSleepReport);


module.exports = router;
