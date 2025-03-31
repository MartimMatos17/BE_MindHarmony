const EmotionalState = require('../models/EmotionalState');

// Função para guardar os dados de estado emocional
exports.uploadEmotionalData = async (req, res) => {
    const { userId, tristeza, stressAnsiedade, excitação, calma, felicidade } = req.body;

    try {
        const newEmotionalData = new EmotionalState({
            userId,
            tristeza,
            stressAnsiedade,
            excitação,
            calma,
            felicidade,
        });

        await newEmotionalData.save();
        res.status(201).json({ message: 'Dados de estado emocional guardados com sucesso!' });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao guardar os dados.', detalhes: err.message });
    }
};

// Função para obter os dados de estado emocional
exports.getEmotionData = async (req, res) => {
    const userId = req.user.id;
    try {
        // Definir limites para cada período
        const limitMinuto = 7;
        const limitDezMinutos = 10;
        const limitHora = 60;

        // Função para buscar os dados de estado emocional e calcular estatísticas
        const buscarDadosEcalcular = async (limite) => {
            const emotionalData = await EmotionalState.find({ userId }).sort({ date: -1 }).limit(limite);

            if (emotionalData.length === 0) {
                return { dados: [], medias: null, dominancia: null };
            }

            // Calcular médias
            const totalLeituras = emotionalData.length;
            const totais = emotionalData.reduce(
                (acc, data) => ({
                    tristeza: acc.tristeza + data.tristeza,
                    stressAnsiedade: acc.stressAnsiedade + data.stressAnsiedade,
                    excitação: acc.excitação + data.excitação,
                    calma: acc.calma + data.calma,
                    felicidade: acc.felicidade + data.felicidade,
                }),
                { tristeza: 0, stressAnsiedade: 0, excitação: 0, calma: 0, felicidade: 0 }
            );

            const medias = {
                tristeza: (totais.tristeza / totalLeituras).toFixed(2),
                stressAnsiedade: (totais.stressAnsiedade / totalLeituras).toFixed(2),
                excitação: (totais.excitação / totalLeituras).toFixed(2),
                calma: (totais.calma / totalLeituras).toFixed(2),
                felicidade: (totais.felicidade / totalLeituras).toFixed(2),
            };

            const ultimo = emotionalData[0];
            const dominancia = ultimo ? {
                tristeza: ultimo.tristeza,
                stressAnsiedade: ultimo.stressAnsiedade,
                excitação: ultimo.excitação,
                calma: ultimo.calma,
                felicidade: ultimo.felicidade,
            } : null;

            const barChartData = { // Example Bar Chart Data
                labels: ['Tristeza', 'Stress', 'Excitação', 'Calma'],
                datasets: [
                    {
                        data: [
                            emotionalData[0]?.tristeza || 0,
                            emotionalData[0]?.stressAnsiedade || 0,
                            emotionalData[0]?.excitação || 0,
                            emotionalData[0]?.calma || 0
                        ],
                        colors: [
                            `rgba(255, 99, 132, 0.8)`,   // Tristeza
                            `rgba(54, 162, 235, 0.8)`,    // Stress/Ansiedade
                            `rgba(255, 206, 86, 0.8)`,    // Excitação
                            `rgba(75, 192, 192, 0.8)`,     // Calma
                        ],
                    },
                ],
            };


            // Preparar dados
            const dados = emotionalData.map(data => ({
                tristeza: data.tristeza,
                stressAnsiedade: data.stressAnsiedade,
                excitação: data.excitação,
                calma: data.calma,
                felicidade: data.felicidade
            })).reverse();

            return { dados, medias, dominancia, barChartData };
        };

        // Buscar e calcular para cada período
        const minuto = await buscarDadosEcalcular(limitMinuto);
        const dezMinutos = await buscarDadosEcalcular(limitDezMinutos);
        const hora = await buscarDadosEcalcular(limitHora);

        const historico = {
            minuto: minuto.dados,
            dezMinutos: dezMinutos.dados,
            hora: hora.dados,
        };
        const dominantEmotion = {
            minuto: minuto.dominancia,
            dezMinutos: dezMinutos.dominancia,
            hora: hora.dominancia,
        }
        const emotionData = {
            minuto: minuto.medias,
            dezMinutos: dezMinutos.medias,
            hora: hora.medias,
        };
        const barData = {
            minuto: minuto.barChartData,
            dezMinutos: dezMinutos.barChartData,
            hora: hora.barChartData,
        }

        res.status(200).json({ emotionData, historico, dominantEmotion, barData });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao obter dados.', detalhes: err.message });
    }
};


// Função para gerar relatório inteligente e detalhado de estado emocional
exports.getEmotionalReport = async (req, res) => {
    const userId = req.user.id;
    try {
        // Obter os dados emocionais do utilizador (últimos 7 dias)
        const emotionalData = await EmotionalState.find({ userId }).sort({ date: -1 });

        if (emotionalData.length === 0) {
            return res.status(200).json({ message: 'Não foram encontrados dados para este utilizador nos últimos 7 dias.' });
        }
        const totalLeituras = emotionalData.length;

        // Cálculo de estatísticas semanais
        const totalDias = emotionalData.length;
        const totais = emotionalData.reduce(
            (acc, data) => ({
                tristeza: acc.tristeza + data.tristeza,
                stressAnsiedade: acc.stressAnsiedade + data.stressAnsiedade,
                excitação: acc.excitação + data.excitação,
                calma: acc.calma + data.calma,
                felicidade: acc.felicidade + data.felicidade,
            }),
            { tristeza: 0, stressAnsiedade: 0, excitação: 0, calma: 0, felicidade: 0 }
        );

        const medias = {
            tristeza: (totais.tristeza / totalDias).toFixed(2),
            stressAnsiedade: (totais.stressAnsiedade / totalDias).toFixed(2),
            excitação: (totais.excitação / totalDias).toFixed(2),
            calma: (totais.calma / totalDias).toFixed(2),
            felicidade: (totais.felicidade / totalDias).toFixed(2),
        };

        const analiseDiaria = emotionalData.reduce((acc, curr) => {
            const data = new Date(curr.date).toLocaleDateString();
            if (!acc[data]) {
                acc[data] = [];
            }
            acc[data].push(curr);
            return acc;
        }, {});

        const detailedAnalysis = Object.entries(analiseDiaria).map(([data, leituras]) => {
            const sumTristeza = leituras.reduce((sum, data) => sum + data.tristeza, 0);
            const mediaTristeza = (sumTristeza / leituras.length).toFixed(2);
            const sumStressAnsiedade = leituras.reduce((sum, data) => sum + data.stressAnsiedade, 0);
            const mediaStressAnsiedade = (sumStressAnsiedade / leituras.length).toFixed(2);
            const sumExcitacao = leituras.reduce((sum, data) => sum + data.excitação, 0);
            const mediaExcitacao = (sumExcitacao / leituras.length).toFixed(2);
            const sumCalma = leituras.reduce((sum, data) => sum + data.calma, 0);
            const mediaCalma = (sumCalma / leituras.length).toFixed(2);
            const sumFelicidade = leituras.reduce((sum, data) => sum + data.felicidade, 0);
            const mediaFelicidade = (sumFelicidade / leituras.length).toFixed(2);

            const elevados = leituras.filter(data => data.tristeza > 60 || data.stressAnsiedade > 60 || data.excitação > 80).length;
            const baixos = leituras.filter(data => data.felicidade < 40 || data.calma < 40).length;
            const normais = leituras.filter(data => data.tristeza <= 60 && data.stressAnsiedade <= 60 && data.excitação <= 80 && data.felicidade >= 40 && data.calma >= 40).length;

            return {
                data,
                mediaTristeza: mediaTristeza,
                mediaStressAnsiedade: mediaStressAnsiedade,
                mediaExcitacao: mediaExcitacao,
                mediaCalma: mediaCalma,
                mediaFelicidade: mediaFelicidade,
                elevados,
                baixos,
                normais,
            }
        });

        // Função para análise personalizada
        const gerarFeedback = (categoria, valor, limites, mensagens) => {
            if (valor > limites.alto) {
                return { mensagem: mensagens.alto, recomendacao: recomendacaoAlta };
            } else if (valor < limites.baixo) {
                return { mensagem: mensagens.baixo, recomendacao: recomendacaoBaixa };
            } else {
                return { mensagem: mensagens.normal, recomendacao: recomendacaoNormal };
            }
        };
        const feedback = [];
        const recomendacoes = [];

        // Definir limites e mensagens para cada categoria emocional
        const categorias = [
            {
                nome: 'tristeza',
                valor: medias.tristeza,
                limites: { baixo: 20, alto: 50 },
                mensagens: {
                    alto: 'Os níveis de tristeza estão elevados, o que pode indicar dificuldades emocionais recentes.',
                    baixo: 'Os níveis de tristeza estão baixos, reflectindo estabilidade emocional.',
                    normal: 'Os níveis de tristeza estão dentro dos parâmetros normais.',
                    recomendacaoAlta: 'Procure apoio emocional junto de amigos, familiares ou um profissional qualificado.',
                    recomendacaoBaixa: 'Mantenha as práticas de bem-estar que contribuem para a sua estabilidade emocional.',
                    recomendacaoNormal: 'Continue a monitorizar o seu estado emocional e a equilibrar as suas emoções.',
                },
            },
            {
                nome: 'stressAnsiedade',
                valor: medias.stressAnsiedade,
                limites: { baixo: 20, alto: 50 },
                mensagens: {
                    alto: 'Os níveis de stress e ansiedade estão elevados, o que pode comprometer o bem-estar físico e mental.',
                    baixo: 'Os níveis de stress estão baixos, sugerindo uma boa gestão emocional.',
                    normal: 'Os níveis de stress e ansiedade estão equilibrados.',
                    recomendacaoAlta: 'Incorpore técnicas de relaxamento, como meditação ou ioga, na sua rotina diária.',
                    recomendacaoBaixa: 'Continue a adoptar estratégias saudáveis para gerir o stress de forma eficaz.',
                    recomendacaoNormal: 'Mantenha um estilo de vida equilibrado para preservar o bem-estar.',
                },
            },
            {
                nome: 'excitação',
                valor: medias.excitação,
                limites: { baixo: 30, alto: 70 },
                mensagens: {
                    alto: 'Os níveis de excitação estão elevados, reflectindo entusiasmo e energia.',
                    baixo: 'Os níveis de excitação estão baixos, o que pode apontar para desmotivação ou fadiga.',
                    normal: 'Os níveis de excitação estão dentro da faixa saudável.',
                    recomendacaoAlta: 'Canalize a sua energia para actividades criativas e produtivas.',
                    recomendacaoBaixa: 'Identifique actividades ou objectivos que o inspirem e motivem.',
                    recomendacaoNormal: 'Mantenha o equilíbrio entre energia e descanso.',
                },
            },
            {
                nome: 'calma',
                valor: medias.calma,
                limites: { baixo: 30, alto: 70 },
                mensagens: {
                    alto: 'Os níveis de calma estão elevados, sugerindo uma excelente capacidade de lidar com o stress.',
                    baixo: 'Os níveis de calma estão baixos, o que pode dificultar o relaxamento.',
                    normal: 'Os níveis de calma estão dentro do esperado.',
                    recomendacaoAlta: 'Continue a priorizar práticas relaxantes que reforcem a sua estabilidade.',
                    recomendacaoBaixa: 'Reserve momentos para descanso e redução de estímulos externos.',
                    recomendacaoNormal: 'Mantenha hábitos que promovam a tranquilidade e o equilíbrio emocional.',
                },
            },
            {
                nome: 'felicidade',
                valor: medias.felicidade,
                limites: { baixo: 40, alto: 70 },
                mensagens: {
                    alto: 'Os níveis de felicidade estão elevados, reflectindo uma atitude positiva.',
                    baixo: 'Os níveis de felicidade estão baixos. É importante compreender os factores que possam estar a influenciá-los.',
                    normal: 'Os níveis de felicidade estão dentro do intervalo esperado.',
                    recomendacaoAlta: 'Continue a envolver-se em actividades que lhe tragam alegria e realização.',
                    recomendacaoBaixa: 'Priorize actividades ou momentos que promovam a sua felicidade.',
                    recomendacaoNormal: 'Mantenha um estilo de vida equilibrado que fomente o seu bem-estar emocional.',
                },
            },
        ];

        // Analisar cada categoria
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

        // Construção do relatório detalhado
        const relatorio = {
            resumoGeral: {
                tristeza: `${medias.tristeza}%`,
                stressAnsiedade: `${medias.stressAnsiedade}%`,
                excitação: `${medias.excitação}%`,
                calma: `${medias.calma}%`,
                felicidade: `${medias.felicidade}%`,
            },
            analiseSemanal: feedback,
        };

        res.status(200).json({ relatorio });
    } catch (err) {
        res.status(400).json({ error: 'Erro ao gerar o relatório.', detalhes: err.message });
    }
};