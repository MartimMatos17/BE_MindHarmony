const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Nome do usuário (único)
  email: { type: String, required: true, unique: true }, // Email do usuário (único)
  password: { type: String, required: true }, // Senha do usuário
  gender: { type: String, required: true }, // Gênero do usuário
  birthdate: { type: Date, required: true }, // Data de nascimento do usuário
  emergencyContact: { type: mongoose.Schema.Types.ObjectId, ref: 'EmergencyContact' }, // Referência ao contato de emergência
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' }], // Referência aos amigos da tabela Location
});

module.exports = mongoose.model('User', UserSchema);
