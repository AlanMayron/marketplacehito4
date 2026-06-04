const { Readable } = require("stream");
const db = require("../db/config");
const cloudinary = require("../config/cloudinary");

const subirAvatarACloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "marketplace/avatars",
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
};

const eliminarAvatarCloudinary = async (publicId) => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId);
};

const obtenerPerfil = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         u.id,
         u.nombre,
         u.email,
         u.telefono,
         u.avatar_url,
         u.avatar_public_id,
         COUNT(DISTINCT p.id)::INTEGER AS publicaciones,
         COUNT(DISTINCT f.id)::INTEGER AS favoritos
       FROM usuarios u
       LEFT JOIN publicaciones p ON p.usuario_id = u.id
       LEFT JOIN favoritos f ON f.usuario_id = u.id
       WHERE u.id = $1
       GROUP BY u.id, u.nombre, u.email, u.telefono, u.avatar_url, u.avatar_public_id`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;

    if (!nombre || !email || !telefono) {
      return res.status(400).json({
        message: "Nombre, email y teléfono son obligatorios",
      });
    }

    const result = await db.query(
      `UPDATE usuarios
       SET nombre = $1, email = $2, telefono = $3
       WHERE id = $4
       RETURNING id, nombre, email, telefono, avatar_url, avatar_public_id`,
      [nombre.trim(), email.trim().toLowerCase(), telefono.trim(), req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.status(200).json({
      message: "Perfil actualizado correctamente",
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "Ese correo ya está registrado por otro usuario" });
    }

    console.error("Error al actualizar perfil:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const actualizarAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Debes seleccionar una imagen de perfil",
      });
    }

    const currentUser = await db.query(
      `SELECT avatar_public_id
       FROM usuarios
       WHERE id = $1`,
      [req.user.id]
    );

    if (currentUser.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const uploadResult = await subirAvatarACloudinary(req.file);

    const result = await db.query(
      `UPDATE usuarios
       SET avatar_url = $1,
           avatar_public_id = $2
       WHERE id = $3
       RETURNING id, nombre, email, telefono, avatar_url, avatar_public_id`,
      [uploadResult.secure_url, uploadResult.public_id, req.user.id]
    );

    await eliminarAvatarCloudinary(currentUser.rows[0].avatar_public_id);

    return res.status(200).json({
      message: "Foto de perfil actualizada correctamente",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error al actualizar avatar:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
  actualizarAvatar,
};