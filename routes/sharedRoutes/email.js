const express = require('express');
const router = express.Router();
const { sendEmail } = require('../../controllers/sharedControllers/emailController');

// Definir rota POST para envio de email
router.post('/send-email', sendEmail);

module.exports = router;
