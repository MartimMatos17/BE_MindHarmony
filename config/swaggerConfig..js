const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Monitorização de Oxigénio e Frequência Cardíaca',
      version: '1.0.0',
      description: 'Documentação detalhada da API para monitorização de saúde.',
      contact: {
        name: 'Desenvolvedor',
        email: 'mindharmony17@email.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
    ],
  },
  apis: ['./routes/*.js'], // Caminho para os arquivos com rotas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

module.exports = swaggerDocs;
