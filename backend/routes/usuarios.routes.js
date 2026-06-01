const express = require('express');
const { registrarUsuario } = require('../controllers/usuarios.controller');

const router = express.Router();

router.post('/', registrarUsuario);

module.exports = router;
