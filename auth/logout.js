exports.logout = async (req, res) => {
    res.header('auth-token', '').send({ message: 'Logout bem-sucedido' });
  };
  