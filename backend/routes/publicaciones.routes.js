const express = require("express");
const validarToken = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  listarPublicaciones,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
} = require("../controllers/publicaciones.controller");

const router = express.Router();

router.get("/", listarPublicaciones);
router.get("/:id", obtenerPublicacion);

router.post(
  "/",
  validarToken,
  upload.array("imagenes", 3),
  crearPublicacion
);

router.put(
  "/:id",
  validarToken,
  upload.array("imagenes", 3),
  actualizarPublicacion
);

router.delete("/:id", validarToken, eliminarPublicacion);

module.exports = router;