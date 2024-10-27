exports.refreshToken = async (req, res) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Acesso negado');
  
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET);
      const newToken = jwt.sign({ userId: verified.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.header('auth-token', newToken).send({ token: newToken });
    } catch (err) {
      res.status(400).send('Token inválido ou expirado');
    }
  };
  