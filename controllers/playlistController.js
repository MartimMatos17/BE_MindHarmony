const Playlist = require('../models/Playlist');

// Criar uma nova playlist
exports.createPlaylist = async (req, res) => {
  try {
    const { name, songs, vibrationSettings } = req.body;

    const newPlaylist = await Playlist.create({
      userId: req.user.id,
      name,
      songs,
      vibrationSettings,
    });

    res.status(201).json({ message: 'Playlist criada com sucesso!', playlist: newPlaylist });
  } catch (error) {
    console.error('Erro ao criar a playlist:', error);
    res.status(500).json({ error: 'Erro ao criar a playlist', details: error.message });
  }
};

// Deletar uma playlist
exports.deletePlaylist = async (req, res) => {
  try {
    let { playlistId } = req.params;

    // Certifique-se de limpar espaços ou quebras de linha no ID
    playlistId = playlistId.trim();

    // Verifica se o ID é válido no formato ObjectId do MongoDB
    if (!playlistId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'ID inválido para a playlist.' });
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada.' });
    }

    // Verificar se o usuário autenticado é o dono da playlist
    if (playlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Acesso negado. Você não pode excluir esta playlist.' });
    }

    // Exclua a playlist do banco de dados
    await Playlist.findByIdAndDelete(playlistId);

    res.status(200).json({ message: 'Playlist deletada com sucesso!' });
  } catch (error) {
    console.error('Erro ao deletar playlist:', error);
    res.status(500).json({ error: 'Erro ao deletar playlist.', details: error.message });
  }
};



// Remover uma música da playlist
exports.removeSongFromPlaylist = async (req, res) => {
  try {
    const { playlistId, songId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    const songIndex = playlist.songs.findIndex((song) => song._id.toString() === songId);
    if (songIndex === -1) {
      return res.status(404).json({ error: 'Música não encontrada na playlist' });
    }

    playlist.songs.splice(songIndex, 1); // Remove a música da lista
    await playlist.save();

    res.status(200).json({ message: 'Música removida com sucesso!', playlist });
  } catch (error) {
    console.error('Erro ao remover música:', error);
    res.status(500).json({ error: 'Erro ao remover música', details: error.message });
  }
};

// Adicionar uma música à playlist
exports.addSongToPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { title, artist, uri } = req.body;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    playlist.songs.push({ title, artist, uri });
    await playlist.save();

    res.status(200).json({ message: 'Música adicionada com sucesso!', playlist });
  } catch (error) {
    console.error('Erro ao adicionar música:', error);
    res.status(500).json({ error: 'Erro ao adicionar música', details: error.message });
  }
};

// Listar playlists do usuário autenticado
exports.getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find({ userId: req.user.id });
    res.status(200).json(playlists);
  } catch (error) {
    console.error('Erro ao buscar playlists:', error);
    res.status(500).json({ error: 'Erro ao buscar playlists', details: error.message });
  }
};

// Obter detalhes de uma playlist específica
exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.playlistId);

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    res.status(200).json(playlist);
  } catch (error) {
    console.error('Erro ao buscar detalhes da playlist:', error);
    res.status(500).json({ error: 'Erro ao buscar detalhes da playlist', details: error.message });
  }
};

// Reproduzir playlist com vibração
exports.playPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist não encontrada' });
    }

    res.status(200).json({
      message: 'Reproduzindo playlist com vibração',
      playlist,
    });
  } catch (error) {
    console.error('Erro ao reproduzir playlist:', error);
    res.status(500).json({ error: 'Erro ao reproduzir a playlist', details: error.message });
  }
};