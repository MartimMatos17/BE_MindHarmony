const Vibration = require('../models/Vibration');

// Salvar ou atualizar configurações de vibração do utilizador
exports.updateVibrationSettings = async (req, res) => {
  try {
    const { intensidade, tempo, checked } = req.body;

    // Verifica se já existe configuração para o utilizador
    let vibration = await Vibration.findOne({ userId: req.user.id });

    if (vibration) {
      // Atualiza as configurações existentes
      vibration.intensidade = intensidade;
      vibration.tempo = tempo;
      vibration.checked = checked;
    } else {
      // Cria novas configurações
      vibration = new Vibration({
        userId: req.user.id,
        intensidade,
        tempo,
        checked,
      });
    }

    await vibration.save();

    res.status(200).json({ message: 'Configurações de vibração salvas com sucesso!', vibration });
  } catch (error) {
    console.error('Erro ao salvar configurações de vibração:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações de vibração', details: error.message });
  }
};

// Obter configurações de vibração do utilizador
exports.getVibrationSettings = async (req, res) => {
  try {
    const vibration = await Vibration.findOne({ userId: req.user.id });

    if (!vibration) {
      return res.status(404).json({ message: 'Nenhuma configuração de vibração encontrada.' });
    }

    res.status(200).json(vibration);
  } catch (error) {
    console.error('Erro ao obter configurações de vibração:', error);
    res.status(500).json({ error: 'Erro ao obter configurações de vibração', details: error.message });
  }
};
