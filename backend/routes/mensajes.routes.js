const express = require('express');
const validarToken = require('../middlewares/auth.middleware');
const {
  listarMensajes,
  enviarMensaje,
  responderMensaje,
} = require('../controllers/mensajes.controller');

const router = express.Router();

router.get('/', validarToken, listarMensajes);
router.post('/', validarToken, enviarMensaje);
router.post('/:id/respuestas', validarToken, responderMensaje);

module.exports = router;
