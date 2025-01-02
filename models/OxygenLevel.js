const mongoose = require('mongoose');

const oxygenLevelSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  oxygenLevel: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('OxygenLevel', oxygenLevelSchema);
    