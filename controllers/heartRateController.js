const HeartRate = require('../models/HeartRate');

// Função para salvar dados de frequência cardíaca
exports.uploadHeartRate = async (req, res) => {
  const { userId, bpm } = req.body;
  
  try {
    const newHeartRate = new HeartRate({ userId, bpm });
    await newHeartRate.save();
    res.status(201).json({ message: 'Dados de frequência cardíaca salvos com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao salvar dados', details: err.message });
  }
};

// Função para gerar relatório de frequência cardíaca
exports.getHeartRateReport = async (req, res) => {
  const { userId } = req.params;

  try {
    // Buscar os últimos dados de frequência cardíaca do usuário
    const heartRateData = await HeartRate.find({ userId }).sort({ timestamp: -1 });

    // Cálculo de BPM médio, mínimo e máximo
    const totalData = heartRateData.length;
    if (totalData === 0) {
      return res.status(200).json({ message: 'Nenhum dado encontrado para este usuário' });
    }

    const totalBPM = heartRateData.reduce((sum, data) => sum + data.bpm, 0);
    const averageBPM = (totalBPM / totalData).toFixed(2);
    const maxBPM = Math.max(...heartRateData.map(data => data.bpm));
    const minBPM = Math.min(...heartRateData.map(data => data.bpm));

    const report = {
      averageBPM,
      maxBPM,
      minBPM,
      totalReadings: totalData,
      details: heartRateData,
    };

    res.status(200).json({ report });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao gerar relatório', details: err.message });
  }
};
