const db = require('../db/config');

const agregarRespuestas = async (mensajes) => {
  if (mensajes.length === 0) {
    return [];
  }

  const ids = mensajes.map((mensaje) => mensaje.id);
  const respuestasResult = await db.query(
    `SELECT
       r.id,
       r.mensaje_id AS "mensajeId",
       r.usuario_id AS "usuarioId",
       u.nombre AS autor,
       r.respuesta,
       TO_CHAR(r.created_at, 'DD/MM/YYYY HH24:MI') AS fecha
     FROM mensaje_respuestas r
     INNER JOIN usuarios u ON u.id = r.usuario_id
     WHERE r.mensaje_id = ANY($1::int[])
     ORDER BY r.created_at ASC`,
    [ids]
  );

  return mensajes.map((mensaje) => ({
    ...mensaje,
    respuestas: respuestasResult.rows.filter(
      (respuesta) => Number(respuesta.mensajeId) === Number(mensaje.id)
    ),
  }));
};

const listarMensajes = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
         m.id,
         m.publicacion_id AS "publicacionId",
         p.titulo AS "tituloPublicacion",
         m.vendedor_id AS "vendedorId",
         vendedor.nombre AS vendedor,
         m.comprador_id AS "compradorId",
         comprador.nombre AS comprador,
         comprador.email AS "compradorEmail",
         m.mensaje,
         TO_CHAR(m.created_at, 'DD/MM/YYYY HH24:MI') AS fecha
       FROM mensajes m
       INNER JOIN publicaciones p ON p.id = m.publicacion_id
       INNER JOIN usuarios comprador ON comprador.id = m.comprador_id
       INNER JOIN usuarios vendedor ON vendedor.id = m.vendedor_id
       WHERE m.comprador_id = $1 OR m.vendedor_id = $1
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    const mensajesConRespuestas = await agregarRespuestas(result.rows);

    return res.status(200).json(mensajesConRespuestas);
  } catch (error) {
    console.error('Error al listar mensajes:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const enviarMensaje = async (req, res) => {
  try {
    const { publicacion_id, mensaje } = req.body;

    if (!publicacion_id || !mensaje || mensaje.trim() === '') {
      return res.status(400).json({
        message: 'Publicación y mensaje son obligatorios',
      });
    }

    const publicacion = await db.query(
      `SELECT id, usuario_id AS vendedor_id
       FROM publicaciones
       WHERE id = $1`,
      [publicacion_id]
    );

    if (publicacion.rowCount === 0) {
      return res.status(404).json({ message: 'Publicación no encontrada' });
    }

    const vendedorId = publicacion.rows[0].vendedor_id;

    if (Number(vendedorId) === Number(req.user.id)) {
      return res.status(400).json({
        message: 'No puedes enviarte un mensaje a ti mismo',
      });
    }

    const insert = await db.query(
      `INSERT INTO mensajes (publicacion_id, comprador_id, vendedor_id, mensaje)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [publicacion_id, req.user.id, vendedorId, mensaje.trim()]
    );

    return res.status(201).json({
      message: 'Mensaje enviado correctamente',
      mensaje_id: insert.rows[0].id,
    });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const responderMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { respuesta } = req.body;

    if (!respuesta || respuesta.trim() === '') {
      return res.status(400).json({ message: 'La respuesta no puede estar vacía' });
    }

    const mensaje = await db.query(
      `SELECT id, comprador_id, vendedor_id
       FROM mensajes
       WHERE id = $1`,
      [id]
    );

    if (mensaje.rowCount === 0) {
      return res.status(404).json({ message: 'Mensaje no encontrado' });
    }

    const isParticipant =
      Number(mensaje.rows[0].comprador_id) === Number(req.user.id) ||
      Number(mensaje.rows[0].vendedor_id) === Number(req.user.id);

    if (!isParticipant) {
      return res.status(403).json({ message: 'No puedes responder este mensaje' });
    }

    await db.query(
      `INSERT INTO mensaje_respuestas (mensaje_id, usuario_id, respuesta)
       VALUES ($1, $2, $3)`,
      [id, req.user.id, respuesta.trim()]
    );

    return res.status(201).json({ message: 'Respuesta enviada correctamente' });
  } catch (error) {
    console.error('Error al responder mensaje:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  listarMensajes,
  enviarMensaje,
  responderMensaje,
};
