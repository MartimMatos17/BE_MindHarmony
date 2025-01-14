const mongoose = require('mongoose');

// Modelo de Música
const SongSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String },
  uri: { type: String, required: true }, // URL ou caminho do arquivo de música
});

// Configurações de Vibração
const VibrationSettingsSchema = new mongoose.Schema({
  intensity: { type: Number, default: 0.5 }, // Intensidade (0 a 1)
  duration: { type: Number, default: 1 },   // Duração em segundos
  pattern: { type: String, default: 'continuous' }, // Padrão de vibração
});

// Modelo de Playlist
const PlaylistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Conexão com o usuário
  name: { type: String, required: true }, // Nome da playlist
  songs: [SongSchema], // Lista de músicas
  vibrationSettings: VibrationSettingsSchema, // Configurações de vibração
}, { timestamps: true }); // timestamps adiciona 'createdAt' e 'updatedAt'

module.exports = mongoose.model('Playlist', PlaylistSchema);
