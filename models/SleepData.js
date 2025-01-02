const mongoose = require('mongoose');

const sleepDataSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  totalSleepHours: { type: Number, required: true }, // Total de horas dormidas
  remSleepHours: { type: Number, required: true },   // Horas de sono REM
  deepSleepHours: { type: Number, required: true },  // Horas de sono profundo
  lightSleepHours: { type: Number, required: true }, // Horas de sono leve
  interruptions: { type: Number, default: 0 },       // Número de interrupções
  date: { type: Date, default: Date.now },           // Data do registo
});

module.exports = mongoose.model('SleepData', sleepDataSchema);
