const express = require('express');
const { uploadOxygenLevel, getOxygenLevelReport, getOxygenData } = require('../controllers/oxygenLevelController');
const router = express.Router();
const cors = require('cors');
const authMiddleware = require('../middleware/authMiddleware.js');

router.use(cors());

router.post('/upload-oxygen-level', authMiddleware, uploadOxygenLevel);

router.get('/get-oxygen-data', authMiddleware, getOxygenData);

router.get('/report', authMiddleware, getOxygenLevelReport);

module.exports = router;