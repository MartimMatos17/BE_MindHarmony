const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Acesso negado.');

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;  // Armazena o ID do utilizador no request
    next();               // Permite que continue para a rota protegida
  } catch (err) {
    res.status(400).send('Token inválido.');
  }
}

module.exports = authMiddleware;
