const express = require('express');
const { register, login, changePassword } = require('../controllers/authController'); // Importe a nova função
const authMiddleware = require('../middleware/authMiddleware'); // Importe o middleware

const router = express.Router();

// Rota de registo (Sign Up)
router.post('/register', register);

// Rota de login
router.post('/login', login);

// Nova rota para mudar a password (necessita de autenticação)
router.put('/change-password', authMiddleware, changePassword);

module.exports = router;