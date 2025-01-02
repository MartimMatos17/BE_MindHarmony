const OxygenLevel = require('../models/OxygenLevel');

// Função para guardar dados de saturação de oxigénio
exports.uploadOxygenLevel = async (req, res) => {
  const { userId, oxygenLevel } = req.body;

  try {
    const newOxygenLevel = new OxygenLevel({ userId, oxygenLevel });
    await newOxygenLevel.save();
    res.status(201).json({ message: 'Dados de saturação de oxigénio guardados com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao guardar os dados.', detalhes: err.message });
  }
};

// Função para gerar relatório detalhado e inteligente de saturação de oxigénio
exports.getOxygenLevelReport = async (req, res) => {
  const { userId } = req.params;

  try {
    // Obter os últimos dados de saturação de oxigénio do utilizador
    const oxygenLevelData = await OxygenLevel.find({ userId }).sort({ timestamp: -1 });

    // Verificar se existem dados
    const totalLeituras = oxygenLevelData.length;
    if (totalLeituras === 0) {
      return res.status(200).json({ message: 'Não foram encontrados dados para este utilizador.' });
    }

    // Cálculo de valores médios, máximos e mínimos
    const somaSaturacao = oxygenLevelData.reduce((sum, data) => sum + data.oxygenLevel, 0);
    const mediaSaturacao = (somaSaturacao / totalLeituras).toFixed(2);
    const maxSaturacao = Math.max(...oxygenLevelData.map(data => data.oxygenLevel));
    const minSaturacao = Math.min(...oxygenLevelData.map(data => data.oxygenLevel));

    // Classificação das leituras
    const leiturasCriticas = oxygenLevelData.filter(data => data.oxygenLevel < 90);
    const leiturasBaixas = oxygenLevelData.filter(data => data.oxygenLevel >= 90 && data.oxygenLevel < 95);
    const leiturasNormais = oxygenLevelData.filter(data => data.oxygenLevel >= 95);

    // Percentagens de cada categoria
    const percentagemCriticas = ((leiturasCriticas.length / totalLeituras) * 100).toFixed(2);
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
        nome: 'mediaSaturacao',
        valor: mediaSaturacao,
        limites: { baixo: 92, alto: 95 },
        mensagens: {
          alto: 'A saturação média está em níveis excelentes (acima de 95%).',
          baixo: 'A saturação média encontra-se abaixo do recomendado (menos de 92%).',
          normal: 'A saturação média está dentro do intervalo saudável (92%-95%).',
          recomendacaoAlta: 'Continue a manter uma boa rotina de saúde e monitorize regularmente.',
          recomendacaoBaixa: 'Considere exercícios respiratórios e consulte um profissional de saúde.',
          recomendacaoNormal: 'Mantenha hábitos saudáveis para preservar a oxigenação ideal.',
        },
      },
      {
        nome: 'percentagemCriticas',
        valor: percentagemCriticas,
        limites: { baixo: 10, alto: 20 },
        mensagens: {
          alto: 'Mais de 20% das leituras estão em níveis críticos (abaixo de 90%).',
          baixo: 'Menos de 10% das leituras estão em níveis críticos, o que é positivo.',
          normal: 'Algumas leituras encontram-se em níveis críticos. Atenção recomendada.',
          recomendacaoAlta: 'Procure assistência médica urgente para avaliar possíveis causas de hipoxemia.',
          recomendacaoBaixa: 'Continue a monitorizar regularmente para prevenir deteriorações.',
          recomendacaoNormal: 'Recomenda-se acompanhamento médico se este padrão persistir.',
        },
      },
      {
        nome: 'percentagemBaixas',
        valor: percentagemBaixas,
        limites: { baixo: 20, alto: 30 },
        mensagens: {
          alto: 'Um número significativo de leituras encontra-se entre 90% e 95%, indicando necessidade de atenção.',
          baixo: 'Poucas leituras encontram-se entre 90% e 95%, o que é um sinal positivo.',
          normal: 'Leituras baixas moderadas. Monitorização contínua é recomendada.',
          recomendacaoAlta: 'Aumente a frequência de monitorização e ajuste as rotinas diárias para melhorar a oxigenação.',
          recomendacaoBaixa: 'Continue a manter níveis saudáveis e registe eventuais alterações.',
          recomendacaoNormal: 'Monitore regularmente para garantir que as leituras não se agravem.',
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
        mediaSaturacao: `${mediaSaturacao}%`,
        saturacaoMaxima: `${maxSaturacao}%`,
        saturacaoMinima: `${minSaturacao}%`,
        totalLeituras,
        percentagemCriticas: `${percentagemCriticas}%`,
        percentagemBaixas: `${percentagemBaixas}%`,
        percentagemNormais: `${percentagemNormais}%`,
      },
      detalhes: {
        leiturasCriticas,
        leiturasBaixas,
        leiturasNormais,
        todasAsLeituras: oxygenLevelData,
      },
      analiseSemanal: feedback,
      recomendacoes,
    };

    res.status(200).json({ relatorio });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao gerar o relatório.', detalhes: err.message });
  }
};
