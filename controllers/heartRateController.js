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

// Função para obter os dados de frequência cardíaca para o grafico e a tela inicial
exports.getBPMData = async (req, res) => {
    const userId = req.user.id;
    try {
        // Buscar os últimos dados de frequência cardíaca do usuário
        const heartRateData = await HeartRate.find({ userId }).sort({ timestamp: -1 });

        // Verificar se existem dados
        const totalLeituras = heartRateData.length;
        if (totalLeituras === 0) {
            return res.status(200).json({ message: 'Nenhum dado encontrado para este usuário.' });
        }

        // Calcular média, pico e mínimo dos últimos 7 registros
        const lastSeven = heartRateData.slice(0, 7);
        const lastTen = heartRateData.slice(0, 10);
        const lastHour = heartRateData.slice(0, 60);

        const somaBPM = heartRateData.reduce((sum, data) => sum + data.bpm, 0);
        const mediaGeral = Math.floor(somaBPM / totalLeituras)
        const maxBPM = Math.max(...heartRateData.map(data => data.bpm));
        const minBPM = Math.min(...heartRateData.map(data => data.bpm));
        const bpmAtual = heartRateData[0].bpm;


        // Formatar os dados para o gráfico
        const minuto = lastSeven.map((data) => data.bpm).reverse();
        const dezMinutos = lastTen.map((data) => data.bpm).reverse();
        const hora = lastHour.map((data) => data.bpm).reverse();


        const getHeartRateZone = (bpm) => {
            if (bpm <= 70) return 'Repouso';
            if (bpm <= 80) return 'Leve';
            if (bpm <= 90) return 'Moderado';
            return 'Intenso';
        };

        const zonaAtual = getHeartRateZone(bpmAtual);

        const bpmData = {
            minuto: minuto,
            dezMinutos: dezMinutos,
            hora: hora,
            bpmAtual: bpmAtual,
        }

        const estatisticas = {
            mediaGeral: mediaGeral,
            pico: maxBPM,
            minimo: minBPM,
            zonaAtual: zonaAtual,
        }


        res.status(200).json({ bpmData, estatisticas });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao obter dados.', detalhes: err.message });
    }
};

// Função para gerar relatório detalhado e inteligente de frequência cardíaca
exports.getHeartRateReport = async (req, res) => {
    const userId = req.user.id;

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


         // Percentagens de cada categoria
        const leiturasElevadas = heartRateData.filter(data => data.bpm > 100);
        const leiturasBaixas = heartRateData.filter(data => data.bpm < 60);
        const leiturasNormais = heartRateData.filter(data => data.bpm >= 60 && data.bpm <= 100);

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

         // Obter todas as leituras
        const todasAsLeituras = heartRateData;


         // Agrupar leituras por dia
          const leiturasPorDia = heartRateData.reduce((acc, curr) => {
            const data = new Date(curr.timestamp).toLocaleDateString();
            if (!acc[data]) {
              acc[data] = [];
            }
            acc[data].push(curr);
            return acc;
          }, {});
        
        const analiseDiaria = Object.entries(leiturasPorDia).map(([data, leituras]) => {
           const elevados = leituras.filter(data => data.bpm > 100).length;
           const baixos = leituras.filter(data => data.bpm < 60).length;
           const normais = leituras.filter(data => data.bpm >= 60 && data.bpm <= 100).length;
           const somaBPMDia = leituras.reduce((sum, data) => sum + data.bpm, 0);
           const mediaBPMDia = (somaBPMDia / leituras.length).toFixed(2);
            return {
              data,
              elevados,
              baixos,
              normais,
              mediaBPM: mediaBPMDia
            }
        });


    const calcularTempoNaZona = (heartRateData) => {
         const zonas = {
          repouso: 0,
          leve: 0,
          moderado: 0,
          intenso: 0,
        };
    
        for (let i = 1; i < heartRateData.length; i++) {
           const bpm = heartRateData[i].bpm;
            const tempo = heartRateData[i].timestamp - heartRateData[i-1].timestamp
    
          if (bpm <= 70) {
                zonas.repouso += tempo;
             } else if (bpm <= 80) {
                zonas.leve += tempo;
            } else if (bpm <= 90) {
                zonas.moderado += tempo;
            } else {
                zonas.intenso += tempo;
           }
          }
         const totalTempo = Object.values(zonas).reduce((sum, val) => sum + val, 0);
        
         return Object.entries(zonas).reduce((acc, [zona, tempo]) => {
           acc[zona] = (totalTempo === 0) ? 0 : (tempo / totalTempo * 100).toFixed(2);
             return acc;
            }, {});
      };

        const tempoPorZona = calcularTempoNaZona(heartRateData);


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
        res.status(400).json({ error: 'Erro ao gerar relatório.', detalhes: err.message });
    }
};