const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const authHeader = req.header('Authorization'); // Obtém o cabeçalho padrão de autorização
  if (!authHeader) {
    return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
  }

  // Verifica se o cabeçalho segue o padrão "Bearer <token>"
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Formato de token inválido.' });
  }

  try {
    // Verifica e decodifica o token
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Verifica se informações importantes do token existem
    if (!verified.userId) {
      return res.status(400).json({ error: 'Token inválido ou incompleto.' });
    }

    req.user = { id: verified.userId, email: verified.email || null }; // Adiciona id e email (se disponível)
    next(); // Continua para a próxima middleware ou rota
  } catch (err) {
    console.error('Erro ao verificar o token:', err.message);
    res.status(400).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;
