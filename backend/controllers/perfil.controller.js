const db = require('../db/config');

const obtenerPerfil = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         u.id,
         u.nombre,
         u.email,
         u.telefono,
         COUNT(DISTINCT p.id)::INTEGER AS publicaciones,
         COUNT(DISTINCT f.id)::INTEGER AS favoritos
       FROM usuarios u
       LEFT JOIN publicaciones p ON p.usuario_id = u.id
       LEFT JOIN favoritos f ON f.usuario_id = u.id
       WHERE u.id = $1
       GROUP BY u.id, u.nombre, u.email, u.telefono`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email, telefono } = req.body;

    if (!nombre || !email || !telefono) {
      return res.status(400).json({
        message: 'Nombre, email y teléfono son obligatorios',
      });
    }

    const result = await db.query(
      `UPDATE usuarios
       SET nombre = $1, email = $2, telefono = $3
       WHERE id = $4
       RETURNING id, nombre, email, telefono`,
      [nombre.trim(), email.trim().toLowerCase(), telefono.trim(), req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.status(200).json({
      message: 'Perfil actualizado correctamente',
      user: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Ese correo ya está registrado por otro usuario' });
    }

    console.error('Error al actualizar perfil:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  obtenerPerfil,
  actualizarPerfil,
};
