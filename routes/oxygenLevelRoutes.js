const express = require('express');
const { uploadOxygenLevel, getOxygenLevelReport } = require('../controllers/oxygenLevelController');
const router = express.Router();

// Rota para fazer upload dos dados de saturação de oxigênio
router.post('/upload-oxygen-level', uploadOxygenLevel);

// Rota para gerar relatório de saturação de oxigênio
router.get('/report/:userId', getOxygenLevelReport);

module.exports = router;
