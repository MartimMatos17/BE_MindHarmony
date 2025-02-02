const ThermalData = require('../models/ThermalData');

// Função para salvar dados de temperatura
exports.uploadThermalData = async (req, res) => {
    const { userId, temperature } = req.body;

    try {
        const newThermalData = new ThermalData({ userId, temperature ,timestamp: new Date()});
        await newThermalData.save();
        res.status(201).json({ message: 'Dados de temperatura salvos com sucesso!' });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao salvar dados', details: err.message });
    }
};

// Função para obter os dados de temperatura para o gráfico e a tela inicial
exports.getTemperatureData = async (req, res) => {
  const userId = req.user.id;
  try {
    // Buscar os últimos dados de temperatura do usuário, ordenado por _id decrescente para garantir o mais recente
    const thermalData = await ThermalData.find({ userId }).sort({ _id: -1 });

    // Verificar se existem dados
    const totalLeituras = thermalData.length;
    if (totalLeituras === 0) {
      return res.status(200).json({ message: 'Nenhum dado encontrado para este usuário.' });
    }

    // Calcular média, pico e mínimo dos últimos registros
    const lastSeven = thermalData.slice(0, 7);
    const lastTen = thermalData.slice(0, 10);
    const lastHour = thermalData.slice(0, 60);

    const somaTemp = thermalData.reduce((sum, data) => sum + data.temperature, 0);
    const mediaGeral = (somaTemp / totalLeituras).toFixed(2);
    const maxTemp = Math.max(...thermalData.map(data => data.temperature));
    const minTemp = Math.min(...thermalData.map(data => data.temperature));
    const tempAtual = thermalData[0].temperature; // O último valor inserido


    // Formatar os dados para o gráfico (sem o reverse, pois já estão em ordem decrescente)
    const minuto = lastSeven.map((data) => data.temperature);
    const dezMinutos = lastTen.map((data) => data.temperature);
    const hora = lastHour.map((data) => data.temperature);


    const getTemperatureZone = (temp) => {
      if (temp < 36.0) return 'hipotermia';
      if (temp <= 37.5) return 'normal';
      if (temp <= 38.0) return 'febreModerada';
      if (temp <= 39.0) return 'febreAlta';
      return 'hipertermia';
    };

    const zonaAtual = getTemperatureZone(tempAtual);

    const tempData = {
      minuto: minuto,
      dezMinutos: dezMinutos,
      hora: hora,
      tempAtual: tempAtual,
    }
    const estatisticas = {
      mediaGeral: mediaGeral,
      pico: maxTemp,
      minimo: minTemp,
      zonaAtual: zonaAtual,
    }

    res.status(200).json({ tempData, estatisticas });
  } catch (err) {
    res.status(400).json({ error: 'Erro ao obter dados.', detalhes: err.message });
  }
};

// Função para gerar relatório detalhado e inteligente de temperatura
exports.getThermalReport = async (req, res) => {
    const userId = req.user.id;

    try {
        // Buscar os últimos dados de temperatura do usuário
        const thermalData = await ThermalData.find({ userId }).sort({ timestamp: -1 });

        // Verificar se existem dados
        const totalLeituras = thermalData.length;
        if (totalLeituras === 0) {
            return res.status(200).json({ message: 'Nenhum dado encontrado para este usuário.' });
        }

        // Cálculo de valores médios, máximos e mínimos
        const somaTemp = thermalData.reduce((sum, data) => sum + data.temperature, 0);
        const mediaTemp = (somaTemp / totalLeituras).toFixed(2);
        const maxTemp = Math.max(...thermalData.map(data => data.temperature));
        const minTemp = Math.min(...thermalData.map(data => data.temperature));


        // Percentagens de cada categoria
        const leiturasElevadas = thermalData.filter(data => data.temperature > 38.0);
        const leiturasBaixas = thermalData.filter(data => data.temperature < 36.0);
        const leiturasNormais = thermalData.filter(data => data.temperature >= 36.0 && data.temperature <= 38.0);

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
        const todasAsLeituras = thermalData;


        // Agrupar leituras por dia
          const leiturasPorDia = thermalData.reduce((acc, curr) => {
            const data = new Date(curr.timestamp).toLocaleDateString();
            if (!acc[data]) {
              acc[data] = [];
            }
            acc[data].push(curr);
            return acc;
          }, {});
        
        const analiseDiaria = Object.entries(leiturasPorDia).map(([data, leituras]) => {
           const elevados = leituras.filter(data => data.temperature > 38.0).length;
           const baixos = leituras.filter(data => data.temperature < 36.0).length;
           const normais = leituras.filter(data => data.temperature >= 36.0 && data.temperature <= 38.0).length;
           const somaTempDia = leituras.reduce((sum, data) => sum + data.temperature, 0);
           const mediaTempDia = (somaTempDia / leituras.length).toFixed(2);
            return {
              data,
              elevados,
              baixos,
              normais,
               mediaTemp: mediaTempDia
            }
        });


    const calcularTempoNaZona = (thermalData) => {
         const zonas = {
          hipotermia: 0,
          normal: 0,
          febreModerada: 0,
          febreAlta: 0,
          hipertermia: 0,
        };
    
        for (let i = 1; i < thermalData.length; i++) {
           const temp = thermalData[i].temperature;
          const tempo = thermalData[i].timestamp - thermalData[i-1].timestamp
    
            if (temp < 36.0) {
                zonas.hipotermia += tempo;
            } else if (temp <= 37.5) {
                zonas.normal += tempo;
            } else if (temp <= 38.0) {
                zonas.febreModerada += tempo;
            } else if (temp <= 39.0) {
                zonas.febreAlta += tempo;
            } else {
              zonas.hipertermia += tempo
          }
      }
         const totalTempo = Object.values(zonas).reduce((sum, val) => sum + val, 0);
        
          return Object.entries(zonas).reduce((acc, [zona, tempo]) => {
                acc[zona] = (totalTempo === 0) ? 0 : (tempo / totalTempo * 100).toFixed(2);
             return acc;
              }, {});
        };

    const tempoPorZona = calcularTempoNaZona(thermalData);
    

    const feedback = [];
    const recomendacoes = [];

      const categorias = [
      {
        nome: 'mediaTemp',
        valor: mediaTemp,
        limites: { baixo: 36.0, alto: 38.0 },
        mensagens: {
          alto: 'A média de temperatura está acima do limite saudável (acima de 38.0 °C).',
          baixo: 'A média de temperatura está abaixo do limite saudável (menos de 36.0 °C).',
          normal: 'A média de temperatura está dentro do intervalo saudável (36.0-38.0 °C).',
          recomendacaoAlta: 'Consulte um médico se a febre persistir ou for muito alta.',
          recomendacaoBaixa: 'Consulte um médico se a hipotermia persistir.',
          recomendacaoNormal: 'Mantenha um estilo de vida saudável e monitore regularmente a temperatura.',
        },
      },
       {
        nome: 'percentagemElevadas',
        valor: percentagemElevadas,
        limites: { baixo: 10, alto: 20 },
        mensagens: {
          alto: 'Uma porcentagem significativa de leituras está acima de 38.0 °C.',
          baixo: 'Poucas leituras estão acima de 38.0 °C, o que é positivo.',
          normal: 'Algumas leituras estão elevadas, monitorização recomendada.',
           recomendacaoAlta: 'Procure avaliação médica para investigar possíveis causas de febre.',
          recomendacaoBaixa: 'Mantenha um estilo de vida saudável e continue monitorizando a temperatura.',
          recomendacaoNormal: 'Monitore regularmente a temperatura para evitar picos.',
        },
      },
      {
        nome: 'percentagemBaixas',
        valor: percentagemBaixas,
       limites: { baixo: 10, alto: 20 },
          mensagens: {
            alto: 'Uma porcentagem significativa de leituras está abaixo de 36.0 °C.',
            baixo: 'Poucas leituras estão abaixo de 36.0 °C, o que é positivo.',
            normal: 'Algumas leituras estão baixas, atenção recomendada.',
            recomendacaoAlta: 'Considere medidas para aumentar a temperatura corporal e procure avaliação médica.',
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
                mediaTemp: `${mediaTemp} °C`,
                maxTemp: `${maxTemp} °C`,
                minTemp: `${minTemp} °C`,
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
        res.status(400).json({ error: 'Erro ao gerar relatório', details: err.message });
    }
};