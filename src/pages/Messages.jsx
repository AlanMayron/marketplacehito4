import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const Messages = () => {
  const { mensajes, user, addReply } = useAppContext();

  const [replyForms, setReplyForms] = useState({});
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const myMessages = mensajes.filter((mensaje) => {
    return mensaje.compradorId === user?.id || mensaje.vendedorId === user?.id;
  });

  const handleChange = (mensajeId, value) => {
    setReplyForms({
      ...replyForms,
      [mensajeId]: value,
    });

    setFeedback("");
    setError("");
  };

  const handleReply = async (e, mensajeId) => {
    e.preventDefault();

    const result = await addReply({
      mensajeId,
      respuesta: replyForms[mensajeId] || "",
    });

    if (!result.ok) {
      setError(result.message);
      setFeedback("");
      return;
    }

    setFeedback(result.message);
    setError("");

    setReplyForms({
      ...replyForms,
      [mensajeId]: "",
    });
  };

  return (
    <section className="panel">
      <h1 className="page-title">Mensajes</h1>

      {error && <p className="error-message">{error}</p>}
      {feedback && <p className="success-message">{feedback}</p>}

      {myMessages.length === 0 ? (
        <p className="empty-state">Aún no tienes mensajes.</p>
      ) : (
        myMessages.map((mensaje) => (
          <div className="message-card" key={mensaje.id}>
            <strong>{mensaje.tituloPublicacion}</strong>

            <p>{mensaje.mensaje}</p>

            <span>
              De: {mensaje.comprador} | Para: {mensaje.vendedor}
            </span>

            <br />

            <span>Fecha: {mensaje.fecha}</span>

            {mensaje.respuestas?.length > 0 && (
              <div className="reply-list">
                {mensaje.respuestas.map((reply) => (
                  <div className="reply-item" key={reply.id}>
                    <strong>{reply.autor}</strong>
                    <p>{reply.respuesta}</p>
                    <span>{reply.fecha}</span>
                  </div>
                ))}
              </div>
            )}

            <form
              className="reply-form"
              onSubmit={(e) => handleReply(e, mensaje.id)}
            >
              <textarea
                placeholder="Escribe una respuesta..."
                value={replyForms[mensaje.id] || ""}
                onChange={(e) => handleChange(mensaje.id, e.target.value)}
              />

              <button className="btn-primary" type="submit">
                Responder
              </button>
            </form>
          </div>
        ))
      )}
    </section>
  );
};

export default Messages;