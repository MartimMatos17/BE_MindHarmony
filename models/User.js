const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, required: true },
  birthdate: { type: Date, required: true },
  emergencyContact: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' }, // Referência
});

module.exports = mongoose.model('User', UserSchema);
