const bcrypt = require('bcryptjs');
const db = require('../db/config');

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password, telefono } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        message: 'Nombre, email y password son obligatorios',
      });
    }

    const emailNormalizado = email.trim().toLowerCase();
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      `INSERT INTO usuarios (nombre, email, password, telefono)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, telefono`,
      [nombre.trim(), emailNormalizado, passwordHash, telefono || null]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Ya existe un usuario registrado con ese email',
      });
    }

    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  registrarUsuario,
};
