import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarDays,
  faEnvelope,
  faHeart,
  faImage,
  faLocationDot,
  faShieldHeart,
  faTag,
  faUser,
  faStore,
  faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

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
  const [isSending, setIsSending] = useState(false);

  const product = publicaciones.find(
    (item) => Number(item.id || item.publicacion_id) === Number(id)
  );

  if (!product) {
    return (
      <section className="panel detail-not-found">
        <FontAwesomeIcon icon={faImage} />
        <h1>Publicación no encontrada</h1>
        <p>La publicación que buscas no existe o ya no está disponible.</p>

        <Link to="/posts" className="btn-primary">
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver a publicaciones
        </Link>
      </section>
    );
  }

  const productId = product.id || product.publicacion_id;
  const userId = user?.id || user?.usuario_id;
  const productUserId =
    product.usuarioId || product.usuario_id || product.user_id || product.vendedor_id;

  const currentFavorite = isFavorite ? isFavorite(productId) : false;
  const isOwnPost = Number(userId) === Number(productUserId);

  const precio = Number(product.precio || 0).toLocaleString("es-CL");

  const handleFavorite = async () => {
  setError("");
  setFeedback("");

  if (!isAuthenticated) {
    toast.error("Debes iniciar sesión para guardar favoritos.");
    return;
  }

  const result = await toggleFavorito(productId);

  if (!result.ok) {
    setError(result.message);
    toast.error(result.message);
    return;
  }

  setFeedback(result.message);
  toast.success(result.message);
};

  const handleSendMessage = async (e) => {
  e.preventDefault();

  if (mensaje.trim().length < 5) {
    const message = "El mensaje debe tener al menos 5 caracteres.";
    setError(message);
    setFeedback("");
    toast.error(message);
    return;
  }

  setIsSending(true);
  setError("");
  setFeedback("");

  const result = await addMessage({
    publicacionId: productId,
    mensaje: mensaje.trim(),
  });

  setIsSending(false);

  if (!result.ok) {
    setError(result.message);
    toast.error(result.message);
    return;
  }

  setFeedback(result.message);
  toast.success(result.message);
  setMensaje("");
};
  return (
    <section className="detail-page">
      <Link to="/posts" className="back-link">
        <FontAwesomeIcon icon={faArrowLeft} />
        Volver a publicaciones
      </Link>

      <div className="detail-layout detail-layout-modern">
        <div className="panel detail-gallery detail-gallery-modern">
          <div className="detail-main-image detail-main-image-modern">
            {product.imagen ? (
              <img src={product.imagen} alt={product.titulo} />
            ) : (
              <div className="detail-placeholder">
                <FontAwesomeIcon icon={faImage} />
                <span>Sin imagen disponible</span>
              </div>
            )}

            <span className="detail-status-badge">
              <FontAwesomeIcon icon={faCircleCheck} />
              Disponible
            </span>
          </div>

          <div className="detail-thumbs-modern">
            <div className="thumb-active">
              {product.imagen ? (
                <img src={product.imagen} alt={product.titulo} />
              ) : (
                <FontAwesomeIcon icon={faImage} />
              )}
            </div>

            <div>
              <FontAwesomeIcon icon={faImage} />
            </div>

            <div>
              <FontAwesomeIcon icon={faImage} />
            </div>
          </div>

          <div className="detail-safety-card">
            <FontAwesomeIcon icon={faShieldHeart} />
            <div>
              <strong>Compra segura</strong>
              <p>
                Revisa bien el producto, conversa con el vendedor y acuerda un
                punto de entrega seguro.
              </p>
            </div>
          </div>
        </div>

        <div className="panel detail-info detail-info-modern">
          <div className="detail-top">
            <span className="product-category-pill">
              <FontAwesomeIcon icon={faTag} />
              {product.categoria || "Sin categoría"}
            </span>

            <button
              className={`detail-favorite-button ${
                currentFavorite ? "is-favorite" : ""
              }`}
              type="button"
              onClick={handleFavorite}
            >
              <FontAwesomeIcon icon={faHeart} />
              {currentFavorite ? "En favoritos" : "Guardar"}
            </button>
          </div>

          <h1>{product.titulo}</h1>

          <h2 className="detail-price">${precio}</h2>

          <div className="detail-meta-grid">
            <div>
              <FontAwesomeIcon icon={faLocationDot} />
              <span>Ubicación</span>
              <strong>{product.ubicacion || "Sin ubicación"}</strong>
            </div>

            <div>
              <FontAwesomeIcon icon={faStore} />
              <span>Categoría</span>
              <strong>{product.categoria || "Sin categoría"}</strong>
            </div>

            <div>
              <FontAwesomeIcon icon={faCalendarDays} />
              <span>Publicado</span>
              <strong>{product.fecha || "Reciente"}</strong>
            </div>
          </div>

          <div className="detail-description-box">
            <h3>Descripción</h3>
            <p>{product.descripcion}</p>
          </div>

          <div className="seller-box seller-box-modern">
            <div className="seller-avatar">
              <FontAwesomeIcon icon={faUser} />
            </div>

            <div>
              <span>Vendedor</span>
              <strong>{product.vendedor || "Usuario Marketplace"}</strong>
              <p>Usuario registrado en MarketPlace Local</p>
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          {feedback && <p className="success-message">{feedback}</p>}

          {!isAuthenticated ? (
            <Link to="/login" className="btn-primary full-button detail-login">
              <FontAwesomeIcon icon={faEnvelope} />
              Iniciar sesión para contactar
            </Link>
          ) : isOwnPost ? (
            <div className="empty-state own-post-message">
              Esta publicación es tuya, por eso no puedes enviarte un mensaje.
            </div>
          ) : (
            <form className="contact-form contact-form-modern" onSubmit={handleSendMessage}>
              <label>
                <FontAwesomeIcon icon={faEnvelope} />
                Mensaje al vendedor
              </label>

              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Hola, ¿sigue disponible?"
                required
              />

              <button
                className="btn-primary full-button"
                type="submit"
                disabled={isSending}
              >
                <FontAwesomeIcon icon={faEnvelope} />
                {isSending ? "Enviando..." : "Contactar vendedor"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default PostDetail;