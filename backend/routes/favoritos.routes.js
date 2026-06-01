const express = require('express');
const validarToken = require('../middlewares/auth.middleware');
const {
  listarFavoritos,
  agregarFavorito,
  quitarFavorito,
} = require('../controllers/favoritos.controller');

const router = express.Router();

router.get('/', validarToken, listarFavoritos);
router.post('/:publicacion_id', validarToken, agregarFavorito);
router.delete('/:publicacion_id', validarToken, quitarFavorito);

module.exports = router;
