exports.deleteAccount = async (req, res) => {
    const userId = req.user.userId;
  
    try {
      await User.findByIdAndDelete(userId);
      res.status(200).send({ message: 'Conta eliminada com sucesso' });
    } catch (err) {
      res.status(400).send({ error: 'Erro ao eliminar a conta', details: err.message });
    }
  };
  