const express = require('express');
const EmergencyContact = require('../models/EmergencyContact');

const router = express.Router();

// Rota para criar um novo contato de emergência
router.post('/', async (req, res) => {
    const { name, email, phone } = req.body;

    try {
        const newContact = new EmergencyContact({ name, email, phone });
        const savedContact = await newContact.save();
        res.status(201).json(savedContact);
    } catch (error) {
        console.error('Erro ao criar contato de emergência:', error);
        res.status(500).json({ message: 'Erro ao criar contato de emergência' });
    }
});

module.exports = router;
