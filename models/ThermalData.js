const mongoose = require('mongoose');

const thermalDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  temperature: { type: Number, required: true }, // Temperatura corporal em graus Celsius
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ThermalData', thermalDataSchema);
