const OxygenLevel = require('../models/OxygenLevel');

// Função para salvar dados de saturação de oxigênio
exports.uploadOxygenLevel = async (req, res) => {
  const { oxygenLevel } = req.body;
  const userId = req.user.id;

  try {
    const newOxygenLevel = new OxygenLevel({ userId, oxygenLevel });
    await newOxygenLevel.save();
    res.status(201).json({ message: 'Dados de saturação de oxigênio salvos com sucesso!' });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao salvar dados', details: err.message });
  }
};

// Função para obter os dados de saturação de oxigênio para o grafico e a tela inicial
exports.getOxygenData = async (req, res) => {
    const userId = req.user.id;
    try {
        // Buscar os últimos dados de saturação de oxigênio do usuário
        const oxygenData = await OxygenLevel.find({ userId }).sort({ timestamp: -1 });

        // Verificar se existem dados
        const totalLeituras = oxygenData.length;
        if (totalLeituras === 0) {
            return res.status(200).json({ message: 'Nenhum dado encontrado para este usuário.' });
        }

        // Calcular média, pico e mínimo dos últimos 7 registros
       const lastSeven = oxygenData.slice(0, 7);
       const lastTen = oxygenData.slice(0, 10);
       const lastHour = oxygenData.slice(0, 60);

       const somaSaturacao = oxygenData.reduce((sum, data) => sum + data.oxygenLevel, 0);
       const mediaGeral = Math.floor(somaSaturacao / totalLeituras)
       const maxSaturacao = Math.max(...oxygenData.map(data => data.oxygenLevel));
       const minSaturacao = Math.min(...oxygenData.map(data => data.oxygenLevel));
       const saturacaoAtual = oxygenData[0].oxygenLevel;


        // Formatar os dados para o gráfico
       const minuto = lastSeven.map((data) => data.oxygenLevel).reverse();
       const dezMinutos = lastTen.map((data) => data.oxygenLevel).reverse();
       const hora = lastHour.map((data) => data.oxygenLevel).reverse();


        const getOxygenLevelZone = (oxygenLevel) => {
            if (oxygenLevel >= 96) return 'Ótima';
            if (oxygenLevel === 95) return 'Aceitável';
            if (oxygenLevel >= 93 && oxygenLevel <= 94) return 'Atenção';
           return 'Crítica';
         };


         const zonaAtual = getOxygenLevelZone(saturacaoAtual);

        const oxygenLevelData = {
            minuto: minuto,
            dezMinutos: dezMinutos,
            hora: hora,
            saturacaoAtual: saturacaoAtual,
        }

        const estatisticas = {
          mediaGeral: mediaGeral,
          pico: maxSaturacao,
          minimo: minSaturacao,
          zonaAtual: zonaAtual,
      }


        res.status(200).json({ oxygenLevelData, estatisticas });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao obter dados.', detalhes: err.message });
    }
};


// Função para gerar relatório detalhado e inteligente de saturação de oxigénio
exports.getOxygenLevelReport = async (req, res) => {
  const userId = req.user.id;

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


    // Obter todas as leituras
    const todasAsLeituras = oxygenLevelData;


    // Agrupar leituras por dia
    const leiturasPorDia = oxygenLevelData.reduce((acc, curr) => {
        const data = new Date(curr.timestamp).toLocaleDateString();
        if (!acc[data]) {
            acc[data] = [];
        }
        acc[data].push(curr);
        return acc;
    }, {});

    const analiseDiaria = Object.entries(leiturasPorDia).map(([data, leituras]) => {
        const criticas = leituras.filter(data => data.oxygenLevel < 90).length;
        const baixas = leituras.filter(data => data.oxygenLevel >= 90 && data.oxygenLevel < 95).length;
        const normais = leituras.filter(data => data.oxygenLevel >= 95).length;
        const somaSaturacaoDia = leituras.reduce((sum, data) => sum + data.oxygenLevel, 0);
        const mediaSaturacaoDia = (somaSaturacaoDia / leituras.length).toFixed(2);
        return {
          data,
            criticas,
            baixas,
            normais,
          mediaSaturacao: mediaSaturacaoDia
      }
    });


    const calcularTempoNaZona = (oxygenLevelData) => {
      const zonas = {
        otima: 0,
        aceitavel: 0,
        atencao: 0,
        critica: 0,
      };

      for (let i = 1; i < oxygenLevelData.length; i++) {
          const oxygenLevel = oxygenLevelData[i].oxygenLevel;
          const tempo = oxygenLevelData[i].timestamp - oxygenLevelData[i-1].timestamp
          
           if (oxygenLevel >= 96) {
              zonas.otima += tempo;
            } else if (oxygenLevel === 95) {
               zonas.aceitavel += tempo;
            } else if (oxygenLevel >= 93 && oxygenLevel <= 94) {
               zonas.atencao += tempo;
           } else {
               zonas.critica += tempo;
            }
        }

         const totalTempo = Object.values(zonas).reduce((sum, val) => sum + val, 0);
        
         return Object.entries(zonas).reduce((acc, [zona, tempo]) => {
           acc[zona] = (totalTempo === 0) ? 0 : (tempo / totalTempo * 100).toFixed(2);
            return acc;
           }, {});
      };

    const tempoPorZona = calcularTempoNaZona(oxygenLevelData);



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
           tempoPorZona: tempoPorZona,
      },
      analiseDiaria: analiseDiaria,
       detalhes: {
        todasAsLeituras: todasAsLeituras,
        },
      analiseSemanal: feedback,
      recomendacoes,
    };

    res.status(200).json({ relatorio });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao gerar o relatório.', detalhes: err.message });
  }
};