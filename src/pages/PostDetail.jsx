import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";

const PostDetail = () => {
  const { id } = useParams();

  const {
    user,
    publicaciones,
    toggleFavorito,
    isFavorite,
    addMessage,
    isAuthenticated,
  } = useAppContext();

  const [mensaje, setMensaje] = useState("");
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const product = publicaciones.find((item) => item.id === Number(id));

  if (!product) {
    return (
      <div className="panel">
        <h1>Publicación no encontrada</h1>
        <Link to="/posts" className="btn-primary">
          Volver a publicaciones
        </Link>
      </div>
    );
  }

  const currentFavorite = isFavorite(product.id);
  const isOwnPost = Number(user?.id) === Number(product.usuarioId);

  const handleFavorite = async () => {
    const result = await toggleFavorito(product.id);

    if (!result.ok) {
      setError(result.message);
      setFeedback("");
      return;
    }

    setFeedback(result.message);
    setError("");
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    const result = await addMessage({
      publicacionId: product.id,
      mensaje,
    });

    if (!result.ok) {
      setError(result.message);
      setFeedback("");
      return;
    }

    setFeedback(result.message);
    setError("");
    setMensaje("");
  };

  return (
    <section className="detail-layout">
      <div className="panel detail-gallery">
        <div className="detail-main-image">
          {product.imagen ? (
            <img src={product.imagen} alt={product.titulo} />
          ) : (
            <span>⌁</span>
          )}
        </div>

        <div className="thumbs">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>

      <div className="panel detail-info">
        <h1>{product.titulo}</h1>
        <h2>${product.precio.toLocaleString("es-CL")}</h2>

        <p>
          <strong>Categoría:</strong> {product.categoria}
        </p>

        <p>
          <strong>Ubicación:</strong> {product.ubicacion}
        </p>

        <h3>Descripción</h3>
        <p>{product.descripcion}</p>

        <div className="seller-box">
          <p>
            <strong>Vendedor:</strong> {product.vendedor}
          </p>
          <p>Publicado: {product.fecha}</p>
        </div>

        {error && <p className="error-message">{error}</p>}
        {feedback && <p className="success-message">{feedback}</p>}

        <button
          className="btn-secondary full-button"
          type="button"
          onClick={handleFavorite}
        >
          {currentFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        </button>

        {!isAuthenticated ? (
          <Link to="/login" className="btn-primary full-button detail-login">
            Iniciar sesión para contactar
          </Link>
        ) : isOwnPost ? (
          <p className="empty-state own-post-message">
            Esta publicación es tuya, por eso no puedes enviarte un mensaje.
          </p>
        ) : (
          <form className="contact-form" onSubmit={handleSendMessage}>
            <label>Mensaje al vendedor</label>
            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Hola, ¿sigue disponible?"
              required
            />

            <button className="btn-primary full-button" type="submit">
              Contactar vendedor
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default PostDetail;