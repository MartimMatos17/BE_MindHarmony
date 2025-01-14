const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Location = require('../models/Location'); // Modelo de Localização
const User = require('../models/User'); // Modelo de Usuário
const authMiddleware = require('../middleware/authMiddleware');

// Rota para salvar uma localização
router.post('/location', async (req, res) => {
  const { name, email, latitude, longitude } = req.body;

  if (!name || !email || !latitude || !longitude) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  try {
    // Atualizar ou criar a localização
    const updatedLocation = await Location.findOneAndUpdate(
      { email: email.toLowerCase() }, // Busca pelo e-mail no banco de dados
      { name, latitude, longitude }, // Atualiza esses campos
      { upsert: true, new: true } // Cria o registro se não existir (upsert)
    );

    return res.status(200).json({ message: 'Localização salva ou atualizada com sucesso!', data: updatedLocation });
  } catch (error) {
    console.error('Erro ao salvar ou atualizar localização:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});




// Rota para adicionar um amigo
router.post('/add-friend', authMiddleware, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'O campo de e-mail é obrigatório.' });
  }

  try {
    // Buscar o amigo na tabela Location
    const friendLocation = await Location.findOne({ email: email.toLowerCase() });
    if (!friendLocation) {
      return res.status(404).json({ message: 'Amigo não encontrado na tabela Location.' });
    }

    // Buscar o usuário logado na tabela User
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário logado não encontrado.' });
    }

    // Verificar se o amigo já foi adicionado
    if (user.friends.includes(friendLocation._id)) {
      return res.status(400).json({ message: 'Este amigo já foi adicionado.' });
    }

    // Adicionar o amigo à lista de amigos do usuário logado
    user.friends.push(friendLocation._id);
    await user.save();

    return res.status(200).json({ message: 'Amigo adicionado com sucesso!', data: friendLocation });
  } catch (error) {
    console.error('Erro ao adicionar amigo:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Rota para obter amigos do usuário logado
router.get('/friends-locations', authMiddleware, async (req, res) => {
  try {
    // Buscar o usuário logado na tabela User
    const user = await User.findById(req.user.id).populate({
      path: 'friends',
      model: 'Location', // Refere-se à tabela `Location`
    });

    if (!user || user.friends.length === 0) {
      return res.status(200).json({ message: 'Você ainda não adicionou nenhum amigo.' });
    }

    return res.status(200).json(user.friends);
  } catch (error) {
    console.error('Erro ao buscar amigos:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

// Rota para deletar um amigo
router.delete('/delete-friend/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'ID inválido.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const friendIndex = user.friends.indexOf(id);
    if (friendIndex === -1) {
      return res.status(404).json({ message: 'Amigo não encontrado na sua lista.' });
    }

    user.friends.splice(friendIndex, 1);
    await user.save();

    return res.status(200).json({ message: 'Amigo removido com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar amigo:', error);
    return res.status(500).json({ message: 'Erro no servidor.' });
  }
});

module.exports = router;
