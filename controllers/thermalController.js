const ThermalData = require('../models/ThermalData');

// Função para guardar dados de temperatura corporal
exports.uploadThermalData = async (req, res) => {
  const { userId, temperature } = req.body;

  try {
    const newThermalData = new ThermalData({
      userId,
      temperature,
    });

    await newThermalData.save();
    res.status(201).json({ message: 'Dados de temperatura corporal guardados com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao guardar dados', details: err.message });
  }
};

// Função para gerar relatório inteligente de bem-estar térmico
exports.getThermalReport = async (req, res) => {
  const { userId } = req.params;

  try {
    // Obter os dados de temperatura do utilizador (últimos 7 dias)
    const thermalData = await ThermalData.find({ userId }).sort({ date: -1 }).limit(7);

    if (thermalData.length === 0) {
      return res.status(200).json({ message: 'Não foram encontrados dados para este utilizador.' });
    }

    // Cálculo de estatísticas
    const totalDias = thermalData.length;
    const temperaturas = thermalData.map(data => data.temperature);
    const temperaturaMedia = (temperaturas.reduce((sum, temp) => sum + temp, 0) / totalDias).toFixed(2);
    const temperaturaMinima = Math.min(...temperaturas).toFixed(2);
    const temperaturaMaxima = Math.max(...temperaturas).toFixed(2);

    // Lógica inteligente para feedback
    let estadoTermico = '';
    let recomendacoes = [];

    if (temperaturaMedia < 36.0) {
      estadoTermico = 'Baixa Temperatura (Hipotermia)';
      recomendacoes.push(
        'A sua temperatura está abaixo do normal. Certifique-se de usar roupa adequada para se aquecer.'
      );
    } else if (temperaturaMedia >= 36.0 && temperaturaMedia <= 37.5) {
      estadoTermico = 'Temperatura Normal';
      recomendacoes.push('A sua temperatura está dentro da faixa saudável. Continue a manter um estilo de vida equilibrado.');
    } else if (temperaturaMedia > 37.5 && temperaturaMedia <= 38.0) {
      estadoTermico = 'Febre Moderada';
      recomendacoes.push(
        'A sua temperatura está ligeiramente elevada. Descanse e hidrate-se bem. Se persistir, procure aconselhamento médico.'
      );
    } else if (temperaturaMedia > 38.0 && temperaturaMedia <= 39.0) {
      estadoTermico = 'Febre Alta';
      recomendacoes.push(
        'A sua temperatura está elevada. É importante monitorizar a febre e, caso não diminua, procurar ajuda médica.'
      );
    } else {
      estadoTermico = 'Febre Muito Alta (Emergência)';
      recomendacoes.push(
        'A sua temperatura está perigosamente alta. Procure assistência médica imediatamente.'
      );
    }

    // Construção do relatório
    const relatorio = {
      resumoGeral: {
        temperaturaMedia: `${temperaturaMedia} °C`,
        temperaturaMinima: `${temperaturaMinima} °C`,
        temperaturaMaxima: `${temperaturaMaxima} °C`,
        estadoTermico,
      },
      detalhamentoDiario: thermalData.map(data => ({
        data: data.date.toISOString().split('T')[0],
        temperatura: `${data.temperature} °C`,
      })),
      recomendacoes,
    };

    res.status(200).json({ relatorio });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao gerar relatório', details: err.message });
  }
};
