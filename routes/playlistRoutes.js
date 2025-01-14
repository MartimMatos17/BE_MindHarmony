const express = require('express');
const {
  createPlaylist,
  addSongToPlaylist,
  playPlaylist,
  getPlaylists,
  getPlaylistById,
  removeSongFromPlaylist,
  deletePlaylist, // Nova função de deletar playlist
} = require('../controllers/playlistController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', authMiddleware, getPlaylists); // Obter todas as playlists do usuário
router.post('/', authMiddleware, createPlaylist); // Criar playlist
router.get('/:playlistId', authMiddleware, getPlaylistById); // Obter detalhes da playlist
router.post('/:playlistId/add-song', authMiddleware, addSongToPlaylist); // Adicionar música
router.post('/:playlistId/play', authMiddleware, playPlaylist); // Reproduzir playlist
router.delete('/:playlistId/remove-song/:songId', authMiddleware, removeSongFromPlaylist); // Remover música da playlist
router.delete('/:playlistId', authMiddleware, deletePlaylist); // Deletar uma playlist

module.exports = router;
