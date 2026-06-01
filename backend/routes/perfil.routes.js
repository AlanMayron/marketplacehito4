const express = require('express');
const validarToken = require('../middlewares/auth.middleware');
const { obtenerPerfil, actualizarPerfil } = require('../controllers/perfil.controller');

const router = express.Router();

router.get('/', validarToken, obtenerPerfil);
router.put('/', validarToken, actualizarPerfil);

module.exports = router;
