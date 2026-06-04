const express = require("express");
const validarToken = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  obtenerPerfil,
  actualizarPerfil,
  actualizarAvatar,
} = require("../controllers/perfil.controller");

const router = express.Router();

router.get("/", validarToken, obtenerPerfil);
router.put("/", validarToken, actualizarPerfil);
router.put("/avatar", validarToken, upload.single("avatar"), actualizarAvatar);

module.exports = router;