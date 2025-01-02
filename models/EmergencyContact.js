const mongoose = require('mongoose');

const EmergencyContactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
});

module.exports = mongoose.model('EmergencyContact', EmergencyContactSchema);
