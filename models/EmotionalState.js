const mongoose = require('mongoose');

const emotionalStateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tristeza: { type: Number, required: true }, // Percentagem de tristeza
  stressAnsiedade: { type: Number, required: true }, // Percentagem de stress/ansiedade
  excitação: { type: Number, required: true }, // Percentagem de excitação/entusiasmo
  calma: { type: Number, required: true }, // Percentagem de calma/relaxamento
  felicidade: { type: Number, required: true }, // Percentagem de felicidade/alegria
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EmotionalState', emotionalStateSchema);
