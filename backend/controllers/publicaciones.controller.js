const { Readable } = require("stream");
const db = require("../db/config");
const cloudinary = require("../config/cloudinary");

const publicacionSelect = `
  SELECT
    p.id,
    p.usuario_id AS "usuarioId",
    p.titulo,
    p.descripcion,
    p.precio::INTEGER AS precio,
    COALESCE(
      (
        SELECT pi.imagen_url
        FROM publicacion_imagenes pi
        WHERE pi.publicacion_id = p.id
        ORDER BY pi.orden ASC
        LIMIT 1
      ),
      p.imagen,
      ''
    ) AS imagen,
    COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', pi.id,
            'url', pi.imagen_url,
            'publicId', pi.public_id,
            'orden', pi.orden
          )
          ORDER BY pi.orden ASC
        )
        FROM publicacion_imagenes pi
        WHERE pi.publicacion_id = p.id
      ),
      '[]'::json
    ) AS imagenes,
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

const subirBufferACloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "marketplace/publicaciones",
        resource_type: "image",
        transformation: [
          { width: 1200, height: 900, crop: "limit" },
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

const eliminarImagenesCloudinary = async (publicIds = []) => {
  const validPublicIds = publicIds.filter(Boolean);

  if (validPublicIds.length === 0) {
    return;
  }

  await Promise.allSettled(
    validPublicIds.map((publicId) => cloudinary.uploader.destroy(publicId))
  );
};

const obtenerPublicacionPorId = async (id) => {
  const result = await db.query(
    `${publicacionSelect}
     WHERE p.id = $1`,
    [id]
  );

  return result.rows[0];
};

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
      conditions.push(
        `(p.titulo ILIKE $${values.length} OR p.descripcion ILIKE $${values.length} OR p.ubicacion ILIKE $${values.length})`
      );
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await db.query(
      `${publicacionSelect}
       ${where}
       ORDER BY p.created_at DESC`,
      values
    );

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error al listar publicaciones:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const obtenerPublicacion = async (req, res) => {
  try {
    const { id } = req.params;

    const publicacion = await obtenerPublicacionPorId(id);

    if (!publicacion) {
      return res.status(404).json({ message: "Publicación no encontrada" });
    }

    return res.status(200).json(publicacion);
  } catch (error) {
    console.error("Error al obtener publicación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

const crearPublicacion = async (req, res) => {
  const client = await db.pool.connect();
  const imagenesSubidas = [];

  try {
    const { titulo, descripcion, precio, imagen, ubicacion, categoria_id } =
      req.body;

    if (!titulo || !descripcion || precio === undefined || !ubicacion || !categoria_id) {
      return res.status(400).json({
        message:
          "Título, descripción, precio, ubicación y categoría son obligatorios",
      });
    }

    const archivos = req.files || [];

    if (archivos.length > 3) {
      return res.status(400).json({
        message: "Puedes subir máximo 3 imágenes por publicación",
      });
    }

    await client.query("BEGIN");

    const result = await client.query(
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
        imagen || "",
        ubicacion.trim(),
      ]
    );

    const publicacionId = result.rows[0].id;

    for (let i = 0; i < archivos.length; i += 1) {
      const uploadResult = await subirBufferACloudinary(archivos[i]);
      imagenesSubidas.push(uploadResult.public_id);

      await client.query(
        `INSERT INTO publicacion_imagenes
          (publicacion_id, imagen_url, public_id, orden)
         VALUES ($1, $2, $3, $4)`,
        [
          publicacionId,
          uploadResult.secure_url,
          uploadResult.public_id,
          i + 1,
        ]
      );

      if (i === 0) {
        await client.query(
          `UPDATE publicaciones
           SET imagen = $1
           WHERE id = $2`,
          [uploadResult.secure_url, publicacionId]
        );
      }
    }

    await client.query("COMMIT");

    const publicacion = await obtenerPublicacionPorId(publicacionId);

    return res.status(201).json({
      message: "Publicación creada correctamente",
      publicacion_id: publicacionId,
      publicacion,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    await eliminarImagenesCloudinary(imagenesSubidas);

    if (error.code === "23503") {
      return res.status(400).json({ message: "Categoría o usuario inválido" });
    }

    if (error.message.includes("Solo se permiten imágenes")) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Error al crear publicación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    client.release();
  }
};

const actualizarPublicacion = async (req, res) => {
  const client = await db.pool.connect();
  const imagenesSubidas = [];

  try {
    const { id } = req.params;
    const { titulo, descripcion, precio, imagen, ubicacion, categoria_id, estado } =
      req.body;

    const archivos = req.files || [];

    if (archivos.length > 3) {
      return res.status(400).json({
        message: "Puedes subir máximo 3 imágenes por publicación",
      });
    }

    await client.query("BEGIN");

    const ownerCheck = await client.query(
      `SELECT id
       FROM publicaciones
       WHERE id = $1 AND usuario_id = $2`,
      [id, req.user.id]
    );

    if (ownerCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Publicación no encontrada o no pertenece al usuario",
      });
    }

    const result = await client.query(
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
      await client.query("ROLLBACK");
      return res.status(404).json({
        message: "Publicación no encontrada o no pertenece al usuario",
      });
    }

    if (archivos.length > 0) {
      const oldImages = await client.query(
        `SELECT public_id
         FROM publicacion_imagenes
         WHERE publicacion_id = $1`,
        [id]
      );

      await client.query(
        `DELETE FROM publicacion_imagenes
         WHERE publicacion_id = $1`,
        [id]
      );

      for (let i = 0; i < archivos.length; i += 1) {
        const uploadResult = await subirBufferACloudinary(archivos[i]);
        imagenesSubidas.push(uploadResult.public_id);

        await client.query(
          `INSERT INTO publicacion_imagenes
            (publicacion_id, imagen_url, public_id, orden)
           VALUES ($1, $2, $3, $4)`,
          [id, uploadResult.secure_url, uploadResult.public_id, i + 1]
        );

        if (i === 0) {
          await client.query(
            `UPDATE publicaciones
             SET imagen = $1
             WHERE id = $2`,
            [uploadResult.secure_url, id]
          );
        }
      }

      await eliminarImagenesCloudinary(oldImages.rows.map((row) => row.public_id));
    }

    await client.query("COMMIT");

    const publicacion = await obtenerPublicacionPorId(id);

    return res.status(200).json({
      message: "Publicación actualizada correctamente",
      publicacion,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    await eliminarImagenesCloudinary(imagenesSubidas);

    if (error.message.includes("Solo se permiten imágenes")) {
      return res.status(400).json({ message: error.message });
    }

    console.error("Error al actualizar publicación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  } finally {
    client.release();
  }
};

const eliminarPublicacion = async (req, res) => {
  try {
    const { id } = req.params;

    const imagenes = await db.query(
      `SELECT public_id
       FROM publicacion_imagenes
       WHERE publicacion_id = $1`,
      [id]
    );

    const result = await db.query(
      `DELETE FROM publicaciones
       WHERE id = $1 AND usuario_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Publicación no encontrada o no pertenece al usuario",
      });
    }

    await eliminarImagenesCloudinary(imagenes.rows.map((row) => row.public_id));

    return res
      .status(200)
      .json({ message: "Publicación eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

module.exports = {
  listarPublicaciones,
  obtenerPublicacion,
  crearPublicacion,
  actualizarPublicacion,
  eliminarPublicacion,
};