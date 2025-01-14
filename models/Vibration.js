const mongoose = require('mongoose');

const vibrationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Relaciona com o utilizador
  intensidade: { type: Number, default: 0.7 }, // Intensidade padrão
  tempo: { type: Number, default: 1.4 }, // Tempo padrão
  checked: { // Define os padrões de vibração
    vibracaoContinua: { type: Boolean, default: false },
    pulsacaoLenta: { type: Boolean, default: true },
    vibracaoRitmica: { type: Boolean, default: false },
    padraoDeOnda: { type: Boolean, default: false },
    pulsacaoRapida: { type: Boolean, default: false },
    padraoAleatorio: { type: Boolean, default: false },
    vibracaoIntermitente: { type: Boolean, default: false },
    padraoCrescente: { type: Boolean, default: false },
    vibracaoPulsante: { type: Boolean, default: false },
  },
});

module.exports = mongoose.model('Vibration', vibrationSchema);
