exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;
  
    try {
      const user = await User.findById(userId);
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).send({ error: 'Senha atual incorreta' });
      }
  
      if (newPassword.length < 8 || newPassword.length > 30) {
        return res.status(400).send({ error: 'A nova senha deve ter entre 8 e 30 caracteres.' });
      }
  
      // Encriptar a nova senha
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
  
      await user.save();
      res.status(200).send({ message: 'Senha alterada com sucesso' });
    } catch (err) {
      res.status(400).send({ error: 'Erro ao alterar a senha', details: err.message });
    }
  };
  