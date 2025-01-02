const SleepData = require('../models/SleepData');

// Função para guardar os dados de sono
exports.uploadSleepData = async (req, res) => {
  const { userId, totalSleepHours, remSleepHours, deepSleepHours, lightSleepHours, interruptions } = req.body;

  try {
    const newSleepData = new SleepData({
      userId,
      totalSleepHours,
      remSleepHours,
      deepSleepHours,
      lightSleepHours,
      interruptions,
    });

    await newSleepData.save();
    res.status(201).json({ message: 'Dados de sono guardados com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao guardar os dados', details: err.message });
  }
};

// Função para gerar o relatório inteligente de sono
exports.getSleepReport = async (req, res) => {
  const { userId } = req.params;

  try {
    // Buscar os dados de sono do utilizador (últimos 7 dias)
    const sleepData = await SleepData.find({ userId }).sort({ date: -1 }).limit(7);

    if (sleepData.length === 0) {
      return res.status(200).json({ message: 'Não foram encontrados dados para este utilizador.' });
    }

    // Cálculo de estatísticas
    const totalDias = sleepData.length;
    const totalHorasDormidas = sleepData.reduce((sum, data) => sum + data.totalSleepHours, 0);
    const mediaHoras = (totalHorasDormidas / totalDias).toFixed(2);
    const totalREM = sleepData.reduce((sum, data) => sum + data.remSleepHours, 0);
    const totalDeep = sleepData.reduce((sum, data) => sum + data.deepSleepHours, 0);
    const totalLight = sleepData.reduce((sum, data) => sum + data.lightSleepHours, 0);
    const totalInterrupcoes = sleepData.reduce((sum, data) => sum + data.interruptions, 0);

    // Lógica inteligente para feedback e recomendações
    const feedback = [];
    const recomendacoes = [];

    if (mediaHoras < 7) {
      feedback.push('O tempo médio de sono está abaixo do recomendado, o que pode impactar a sua energia e concentração.');
      recomendacoes.push('Tente aumentar o tempo de sono, evitando dispositivos electrónicos antes de dormir.');
    } else if (mediaHoras >= 7 && mediaHoras <= 9) {
      feedback.push('O tempo médio de sono está dentro do intervalo ideal.');
      recomendacoes.push('Continue a manter uma rotina de sono consistente.');
    } else {
      feedback.push('O tempo médio de sono está acima do recomendado, o que pode indicar cansaço ou outros problemas.');
      recomendacoes.push('Avalie se está a acordar descansado e ajuste a sua rotina, se necessário.');
    }

    if (totalInterrupcoes > totalDias * 2) {
      feedback.push('O sono está a ser frequentemente interrompido, o que pode comprometer a sua qualidade.');
      recomendacoes.push('Tente reduzir factores externos que possam estar a interromper o sono, como barulho ou luz.');
    }

    if ((totalREM / totalHorasDormidas) * 100 < 20) {
      feedback.push('O sono REM está abaixo do ideal, o que pode afectar a memória e a concentração.');
      recomendacoes.push('Tente criar um ambiente relaxante antes de dormir para melhorar a qualidade do sono REM.');
    }

    if ((totalDeep / totalHorasDormidas) * 100 < 15) {
      feedback.push('O sono profundo está baixo, o que pode afectar a recuperação física.');
      recomendacoes.push('Tente manter um ambiente escuro e silencioso para melhorar o sono profundo.');
    }

    // Construção do relatório
    const relatorio = {
      resumoGeral: {
        totalHorasDormidas: `${totalHorasDormidas} horas`,
        mediaHorasDiarias: `${mediaHoras} horas`,
        totalREM: `${totalREM.toFixed(2)} horas`,
        totalDeep: `${totalDeep.toFixed(2)} horas`,
        totalLight: `${totalLight.toFixed(2)} horas`,
        totalInterrupcoes,
        qualidadeSono: mediaHoras >= 7 && mediaHoras <= 9 ? 'Boa' : 'Fraca',
      },
      detalhamentoDiario: sleepData.map(data => ({
        data: data.date.toISOString().split('T')[0],
        totalHoras: `${data.totalSleepHours} horas`,
        rem: `${data.remSleepHours} horas`,
        profundo: `${data.deepSleepHours} horas`,
        leve: `${data.lightSleepHours} horas`,
        interrupcoes: data.interruptions,
      })),
      analiseSemanal: feedback,
      recomendacoes,
    };

    res.status(200).json({ relatorio });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao gerar o relatório', details: err.message });
  }
};
