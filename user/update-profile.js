exports.updateProfile = async (req, res) => {
  const { username, email, gender, birthdate } = req.body;
  const userId = req.user.userId; // ID do utilizador autenticado

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, email, gender, birthdate },
      { new: true } // Retornar o utilizador atualizado
    );

    res.status(200).send({ message: 'Perfil atualizado com sucesso', user: updatedUser });
  } catch (err) {
    res.status(400).send({ error: 'Erro ao atualizar o perfil', details: err.message });
  }
};
