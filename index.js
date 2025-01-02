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

// Rotas de saturação de oxigênio (nova)
const oxygenLevelRoutes = require('./routes/oxygenLevelRoutes'); // Importa as rotas de saturação de oxigênio
app.use('/api/oxygen-level', oxygenLevelRoutes);

// Rota de envio de email para o site
const emailRoutes = require('./routes/sharedRoutes/email'); // Importa a nova rota de email
app.use('/api/email', emailRoutes); // Configura a rota para envio de email

// Rotas de simulação de frequência cardíaca
const simulateHeartRateRoutes = require('./routes/simulateHeartRateRoutes');
app.use('/api', simulateHeartRateRoutes);

// Rotas de autenticação para o site
const siteAuthRoutes = require('./routes/websiteRoutes/siteAuthRoutes'); // Importa as rotas específicas do site
app.use('/api/website/auth', siteAuthRoutes); // Configura as rotas para o site

// Rotas para contato de emergência
const emergencyContactRoutes = require('./routes/emergencyContactRoutes'); // Importa as rotas de contato de emergência
app.use('/api/emergency-contact', emergencyContactRoutes); // Configura as rotas para contato de emergência

const sleepRoutes = require('./routes/sleepRoutes');
app.use('/api/sleep', sleepRoutes);

const thermalRoutes = require('./routes/thermalRoutes');
app.use('/api/thermal', thermalRoutes);


const emotionalStateRoutes = require('./routes/emotionalStateRoutes');
app.use('/api/emotional-state', emotionalStateRoutes);

const locationRoutes = require('./routes/locationRoutes');
app.use('/api', locationRoutes);

const friendsRoutes = require('./routes/friendsRoutes');
app.use('/api', friendsRoutes);

const manualEmailRoutes = require('./routes/sendManualEmail'); // Certifique-se do caminho correto
app.use('/api', manualEmailRoutes); // Registra as rotas com o prefixo /api




// Rota de teste (opcional)
app.get('/', (req, res) => {
  res.send('API está a funcionar!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
