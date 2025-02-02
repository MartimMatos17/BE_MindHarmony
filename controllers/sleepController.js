const SleepData = require('../models/SleepData');
const moment = require('moment'); // Importe o moment para trabalhar com datas

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

// Função para obter os dados de sono (para gráfico e tela inicial)
exports.getSleepData = async (req, res) => {
   const userId = req.user.id;
    try {
        // Buscar os últimos dados de sono do usuário
        const sleepData = await SleepData.find({ userId }).sort({ date: -1 });


        // Verificar se existem dados
        if (sleepData.length === 0) {
             return res.status(200).json({ message: 'Nenhum dado encontrado para este usuário.' });
        }

        // Buscar os últimos 7 dados
        const lastSeven = sleepData.slice(0, 7);
          const lastTen = sleepData.slice(0, 10);
           const lastMonth = sleepData.slice(0, 30);

        // Calcular média do tempo total dormido
        const somaHoras = sleepData.reduce((sum, data) => sum + data.totalSleepHours, 0);
        const mediaHoras = (somaHoras / sleepData.length).toFixed(2);

         // Formatar os dados para o gráfico
        const hoje = sleepData[0];
        const minuto = lastSeven.map((data) => ({totalSleepHours: data.totalSleepHours, remSleepHours: data.remSleepHours, deepSleepHours: data.deepSleepHours, lightSleepHours: data.lightSleepHours})).reverse();
          const dezMinutos = lastTen.map((data) => ({totalSleepHours: data.totalSleepHours, remSleepHours: data.remSleepHours, deepSleepHours: data.deepSleepHours, lightSleepHours: data.lightSleepHours})).reverse();
          const mes = lastMonth.map((data) => ({totalSleepHours: data.totalSleepHours, remSleepHours: data.remSleepHours, deepSleepHours: data.deepSleepHours, lightSleepHours: data.lightSleepHours})).reverse();

        const sleepTip = 'Mantenha um horário de sono regular para melhorar a qualidade do sono';

        const averageSleep = mediaHoras;


       const totalSleepHours = hoje.totalSleepHours;

     // Formata a duração para "X horas e Y minutos"
       const durationHours = Math.floor(totalSleepHours);
         const durationMinutes = Math.round((totalSleepHours - durationHours) * 60);
          const formattedDuration = `${durationHours} horas e ${durationMinutes} min`;


         // Formata o tempo de sono para "Hora inicial - Hora final"
         const now = moment();
           const startTime = now.clone().subtract(totalSleepHours, 'hours').format('HH:mm');
          const endTime = now.format('HH:mm');
        const time = `${startTime} - ${endTime}`;


         const goalProgress = Math.min( (hoje.totalSleepHours / 8) * 100, 100).toFixed(0);


         // Formatar as horas para as fases do sono
           const formatDuration = (hours) => {
            const durationHours = Math.floor(hours);
            const durationMinutes = Math.round((hours - durationHours) * 60);
              return `${durationHours}h${durationMinutes > 0 ? `${durationMinutes}` : ''}`;
           }
         const remDuration = formatDuration(hoje.remSleepHours);
         const deepDuration = formatDuration(hoje.deepSleepHours);
         const lightDuration = formatDuration(hoje.lightSleepHours);
         const vigiliaDuration = formatDuration(hoje.totalSleepHours - hoje.remSleepHours - hoje.deepSleepHours - hoje.lightSleepHours);


           const phaseInfo = [
                { title: 'Vigília', duration: vigiliaDuration, description: 'Tempo acordado', iconName: 'clockcircleo', color: '#FFB300' },
                { title: 'Sono REM', duration: remDuration, description: 'Sono com sonhos', iconName: 'rocket1', color: '#00C853' },
                { title: 'Sono Leve', duration: lightDuration, description: 'Sono superficial', iconName: 'cloud', color: '#4FC3F7' },
                { title: 'Sono Profundo', duration: deepDuration, description: 'Sono restaurador', iconName: 'dashboard', color: '#6200EE' },
            ];


         const chartData = [1, 2.5, 2, 3];


          const sleepDataResult = {
              duration: formattedDuration,
            time: time,
           chartData: chartData,
             phaseInfo: phaseInfo,
            sleepTip: sleepTip,
            goalProgress: goalProgress,
             averageSleep: averageSleep,
        }
          const historico = {
                minuto: minuto,
               dezMinutos: dezMinutos,
               mes: mes,
         }
            res.status(200).json({ sleepDataResult, historico });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao obter dados.', details: err.message });
   }
};

// Função para gerar o relatório inteligente de sono
exports.getSleepReport = async (req, res) => {
  const userId = req.user.id;

    try {
        // Buscar os dados de sono do utilizador (últimos 7 dias)
        const sleepData = await SleepData.find({ userId }).sort({ date: -1 });

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
            recomendacoes.push('Tente aumentar o tempo de sono, evitando dispositivos eletrónicos antes de dormir.');
        } else if (mediaHoras >= 7 && mediaHoras <= 9) {
            feedback.push('O tempo médio de sono está dentro do intervalo ideal.');
            recomendacoes.push('Continue a manter uma rotina de sono consistente.');
        } else {
            feedback.push('O tempo médio de sono está acima do recomendado, o que pode indicar cansaço ou outros problemas.');
             recomendacoes.push('Avalie se está a acordar descansado e ajuste a sua rotina, se necessário.');
          }

      if (totalInterrupcoes > totalDias * 2) {
           feedback.push('O sono está a ser frequentemente interrompido, o que pode comprometer a sua qualidade.');
            recomendacoes.push('Tente reduzir fatores externos que possam estar a interromper o sono, como barulho ou luz.');
      }

        if ((totalREM / totalHorasDormidas) * 100 < 20) {
           feedback.push('O sono REM está abaixo do ideal, o que pode afetar a memória e a concentração.');
             recomendacoes.push('Tente criar um ambiente relaxante antes de dormir para melhorar a qualidade do sono REM.');
        }

      if ((totalDeep / totalHorasDormidas) * 100 < 15) {
            feedback.push('O sono profundo está baixo, o que pode afetar a recuperação física.');
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