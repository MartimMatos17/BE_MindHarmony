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

// Rotas de autenticação
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Rotas de frequência cardíaca
const heartRateRoutes = require('./routes/heartRateRoutes'); 
app.use('/api/heart-rate', heartRateRoutes); // Adicionar as rotas para frequência cardíaca

// Rota de teste (opcional)
app.get('/', (req, res) => {
  res.send('API está a funcionar!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor a correr em http://localhost:${PORT}`);
});
