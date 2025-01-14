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

  // Função para gerar relatório detalhado e inteligente de frequência cardíaca
  exports.getHeartRateReport = async (req, res) => {
    const { userId } = req.params;

    try {
      // Buscar os últimos dados de frequência cardíaca do usuário
      const heartRateData = await HeartRate.find({ userId }).sort({ timestamp: -1 });

      // Verificar se existem dados
      const totalLeituras = heartRateData.length;
      if (totalLeituras === 0) {
        return res.status(200).json({ message: 'Nenhum dado encontrado para este usuário.' });
      }

      // Cálculo de valores médios, máximos e mínimos
      const somaBPM = heartRateData.reduce((sum, data) => sum + data.bpm, 0);
      const mediaBPM = (somaBPM / totalLeituras).toFixed(2);
      const maxBPM = Math.max(...heartRateData.map(data => data.bpm));
      const minBPM = Math.min(...heartRateData.map(data => data.bpm));

      // Classificação das leituras
      const leiturasElevadas = heartRateData.filter(data => data.bpm > 100);
      const leiturasBaixas = heartRateData.filter(data => data.bpm < 60);
      const leiturasNormais = heartRateData.filter(data => data.bpm >= 60 && data.bpm <= 100);

      // Percentagens de cada categoria
      const percentagemElevadas = ((leiturasElevadas.length / totalLeituras) * 100).toFixed(2);
      const percentagemBaixas = ((leiturasBaixas.length / totalLeituras) * 100).toFixed(2);
      const percentagemNormais = ((leiturasNormais.length / totalLeituras) * 100).toFixed(2);

      // Função para criar feedback e recomendações dinâmicas
      const gerarFeedback = (categoria, valor, limites, mensagens) => {
        if (valor > limites.alto) {
          return { mensagem: mensagens.alto, recomendacao: mensagens.recomendacaoAlta };
        } else if (valor < limites.baixo) {
          return { mensagem: mensagens.baixo, recomendacao: mensagens.recomendacaoBaixa };
        } else {
          return { mensagem: mensagens.normal, recomendacao: mensagens.recomendacaoNormal };
        }
      };

      // Configurações de limites e mensagens para as categorias
      const feedback = [];
      const recomendacoes = [];

      const categorias = [
        {
          nome: 'mediaBPM',
          valor: mediaBPM,
          limites: { baixo: 60, alto: 100 },
          mensagens: {
            alto: 'A média de BPM está acima do limite saudável (acima de 100 BPM).',
            baixo: 'A média de BPM está abaixo do limite saudável (menos de 60 BPM).',
            normal: 'A média de BPM está dentro do intervalo saudável (60-100 BPM).',
            recomendacaoAlta: 'Considere reduzir atividades físicas intensas e consultar um cardiologista.',
            recomendacaoBaixa: 'Considere aumentar a atividade física e buscar orientação médica.',
            recomendacaoNormal: 'Mantenha um estilo de vida equilibrado para preservar um ritmo cardíaco saudável.',
          },
        },
        {
          nome: 'percentagemElevadas',
          valor: percentagemElevadas,
          limites: { baixo: 10, alto: 20 },
          mensagens: {
            alto: 'Uma porcentagem significativa de leituras está acima de 100 BPM.',
            baixo: 'Poucas leituras estão acima de 100 BPM, o que é positivo.',
            normal: 'Algumas leituras estão elevadas, monitorização recomendada.',
            recomendacaoAlta: 'Procure avaliação médica para investigar possíveis causas de taquicardia.',
            recomendacaoBaixa: 'Mantenha atividades regulares e monitorize as leituras.',
            recomendacaoNormal: 'Monitore regularmente para evitar que as leituras aumentem.',
          },
        },
        {
          nome: 'percentagemBaixas',
          valor: percentagemBaixas,
          limites: { baixo: 10, alto: 20 },
          mensagens: {
            alto: 'Uma porcentagem significativa de leituras está abaixo de 60 BPM.',
            baixo: 'Poucas leituras estão abaixo de 60 BPM, o que é positivo.',
            normal: 'Algumas leituras estão baixas, atenção recomendada.',
            recomendacaoAlta: 'Considere exercícios cardiovasculares leves e procure avaliação médica.',
            recomendacaoBaixa: 'Continue a monitorizar regularmente para garantir leituras saudáveis.',
            recomendacaoNormal: 'Acompanhe regularmente as leituras para garantir que permaneçam saudáveis.',
          },
        },
      ];

      // Análise dinâmica para cada categoria
      categorias.forEach(categoria => {
        const resultado = gerarFeedback(
          categoria.nome,
          categoria.valor,
          categoria.limites,
          categoria.mensagens
        );
        feedback.push(resultado.mensagem);
        recomendacoes.push(resultado.recomendacao);
      });

      // Construção do relatório final
      const relatorio = {
        resumoGeral: {
          mediaBPM: `${mediaBPM} BPM`,
          BPMMaximo: `${maxBPM} BPM`,
          BPMMinimo: `${minBPM} BPM`,
          totalLeituras,
          percentagemElevadas: `${percentagemElevadas}%`,
          percentagemBaixas: `${percentagemBaixas}%`,
          percentagemNormais: `${percentagemNormais}%`,
        },
        detalhes: {
          leiturasElevadas,
          leiturasBaixas,
          leiturasNormais,
          todasAsLeituras: heartRateData,
        },
        analiseSemanal: feedback,
        recomendacoes,
      };

      res.status(200).json({ relatorio });
    } catch (err) {
      res.status(400).json({ error: 'Erro ao gerar relatório.', detalhes: err.message });
    }
  };
