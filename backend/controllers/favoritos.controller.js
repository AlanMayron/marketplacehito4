const db = require('../db/config');

const listarFavoritos = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT publicacion_id AS "publicacionId"
       FROM favoritos
       WHERE usuario_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al listar favoritos:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const agregarFavorito = async (req, res) => {
  try {
    const { publicacion_id } = req.params;

    const publicacion = await db.query('SELECT id FROM publicaciones WHERE id = $1', [
      publicacion_id,
    ]);

    if (publicacion.rowCount === 0) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    await db.query(
      `INSERT INTO favoritos (usuario_id, publicacion_id)
       VALUES ($1, $2)
       ON CONFLICT (usuario_id, publicacion_id) DO NOTHING`,
      [req.user.id, publicacion_id]
    );

    return res.status(201).json({ message: 'Publicación agregada a favoritos' });
  } catch (error) {
    console.error('Error al agregar favorito:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const quitarFavorito = async (req, res) => {
  try {
    const { publicacion_id } = req.params;

    await db.query(
      'DELETE FROM favoritos WHERE usuario_id = $1 AND publicacion_id = $2',
      [req.user.id, publicacion_id]
    );

    return res.status(200).json({ message: 'Publicación quitada de favoritos' });
  } catch (error) {
    console.error('Error al quitar favorito:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  listarFavoritos,
  agregarFavorito,
  quitarFavorito,
};
