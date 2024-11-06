const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Conexão com MongoDB

// Carregar variáveis de ambiente do ficheiro .env
dotenv.config();

// Inicializar aplicação
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Para trabalhar com JSON
app.use(cors());         // Para permitir CORS

// Conectar ao MongoDB
connectDB();

// Rotas de autenticação do aplicativo móvel (existente)
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rotas de frequência cardíaca (existente)
const heartRateRoutes = require('./routes/heartRateRoutes'); 
app.use('/api/heart-rate', heartRateRoutes);

// Rota de envio de email para o site
const emailRoutes = require('./routes/sharedRoutes/email'); // Importa a nova rota de email
app.use('/api/email', emailRoutes); // Configura a rota para envio de email

// Rotas de autenticação para o site
const siteAuthRoutes = require('./routes/websiteRoutes/siteAuthRoutes'); // Importa as rotas específicas do site
app.use('/api/website/auth', siteAuthRoutes); // Configura as rotas para o site

// Rota de teste (opcional)
app.get('/', (req, res) => {
  res.send('API está a funcionar!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
