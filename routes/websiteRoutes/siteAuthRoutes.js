// routes/websiteRoutes/siteAuthRoutes.js
const express = require('express');
const { signup, login } = require('../../controllers/websiteControllers/siteAuthController');


const router = express.Router();

// Rota de cadastro (sign up)
router.post('/signup', signup);

// Rota de login
router.post('/login', login);

module.exports = router;