const db = require('../db/config');

const publicacionSelect = `
  SELECT
    p.id,
    p.usuario_id AS "usuarioId",
    p.titulo,
    p.descripcion,
    p.precio::INTEGER AS precio,
    COALESCE(p.imagen, '') AS imagen,
    p.ubicacion,
    p.estado,
    TO_CHAR(p.created_at, 'DD/MM/YYYY') AS fecha,
    c.id AS "categoriaId",
    c.nombre AS categoria,
    u.nombre AS vendedor,
    u.email AS "vendedorEmail",
    u.telefono AS "vendedorTelefono"
  FROM publicaciones p
  INNER JOIN categorias c ON c.id = p.categoria_id
  INNER JOIN usuarios u ON u.id = p.usuario_id
`;

const listarPublicaciones = async (req, res) => {
  try {
    const { categoria_id, precio_min, precio_max, buscar } = req.query;
    const values = [];
    const conditions = [];

    if (categoria_id) {
      values.push(categoria_id);
      conditions.push(`p.categoria_id = $${values.length}`);
    }

    if (precio_min) {
      values.push(precio_min);
      conditions.push(`p.precio >= $${values.length}`);
    }

    if (precio_max) {
      values.push(precio_max);
      conditions.push(`p.precio <= $${values.length}`);
    }

    if (buscar) {
      values.push(`%${buscar}%`);
      conditions.push(`(p.titulo ILIKE $${values.length} OR p.descripcion ILIKE $${values.length} OR p.ubicacion ILIKE $${values.length})`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await db.query(
      `${publicacionSelect}
       ${where}
       ORDER BY p.created_at DESC`,
      values
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al listar publicaciones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const obtenerPublicacion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `${publicacionSelect}
       WHERE p.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener publicación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const crearPublicacion = async (req, res) => {
  try {
    const { titulo, descripcion, precio, imagen, ubicacion, categoria_id } = req.body;

    if (!titulo || !descripcion || precio === undefined || !ubicacion || !categoria_id) {
      return res.status(400).json({
        message: 'Título, descripción, precio, ubicación y categoría son obligatorios',
      });
    }

    const result = await db.query(
      `INSERT INTO publicaciones
        (usuario_id, categoria_id, titulo, descripcion, precio, imagen, ubicacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [
        req.user.id,
        Number(categoria_id),
        titulo.trim(),
        descripcion.trim(),
        Number(precio),
        imagen || '',
        ubicacion.trim(),
      ]
    );

    const publicacion = await db.query(
      `${publicacionSelect}
       WHERE p.id = $1`,
      [result.rows[0].id]
    );

    return res.status(201).json({
      message: 'Publicación creada correctamente',
      publicacion_id: result.rows[0].id,
      publicacion: publicacion.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Categoría o usuario inválido' });
    }

    console.error('Error al crear publicación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const actualizarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, imagen, ubicacion, categoria_id, estado } = req.body;

    const result = await db.query(
      `UPDATE publicaciones
       SET
         titulo = COALESCE($1, titulo),
         descripcion = COALESCE($2, descripcion),
         precio = COALESCE($3, precio),
         imagen = COALESCE($4, imagen),
         ubicacion = COALESCE($5, ubicacion),
         categoria_id = COALESCE($6, categoria_id),
         estado = COALESCE($7, estado)
       WHERE id = $8 AND usuario_id = $9
       RETURNING id`,
      [
        titulo ? titulo.trim() : null,
        descripcion ? descripcion.trim() : null,
        precio !== undefined ? Number(precio) : null,
        imagen !== undefined ? imagen : null,
        ubicacion ? ubicacion.trim() : null,
        categoria_id ? Number(categoria_id) : null,
        estado || null,
        id,
        req.user.id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Publicación no encontrada o no pertenece al usuario',
      });
    }

    const publicacion = await db.query(
      `${publicacionSelect}
       WHERE p.id = $1`,
      [id]
    );

    return res.status(200).json({
      message: 'Publicación actualizada correctamente',
      publicacion: publicacion.rows[0],
    });
  } catch (error) {
    console.error('Error al actualizar publicación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM publicaciones
       WHERE id = $1 AND usuario_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: 'Publicación no encontrada o no pertenece al usuario',
      });
    }

    return res.status(200).json({ message: 'Publicación eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar publicación:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  listarPublicaciones,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
};
