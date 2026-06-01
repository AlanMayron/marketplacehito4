const express = require('express');
const validarToken = require('../middlewares/auth.middleware');
const {
  listarPublicaciones,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
} = require('../controllers/publicaciones.controller');

const router = express.Router();

router.get('/', listarPublicaciones);
router.get('/:id', obtenerPublicacion);
router.post('/', validarToken, crearPublicacion);
router.put('/:id', validarToken, actualizarPublicacion);
router.delete('/:id', validarToken, eliminarPublicacion);

module.exports = router;
