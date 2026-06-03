import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faLocationDot,
  faTag,
  faEye,
  faHeart,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

const ProductCard = ({ product }) => {
  const { isAuthenticated, isFavorite, toggleFavorito } = useAppContext();

  const postId = product.id || product.publicacion_id;
  const favorito = isFavorite ? isFavorite(postId) : false;

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      alert("Debes iniciar sesión para guardar favoritos.");
      return;
    }

    const result = await toggleFavorito(postId);

    if (!result.ok) {
      alert(result.message);
    }
  };

  const precio = Number(product.precio || 0).toLocaleString("es-CL");

  return (
    <article className="product-card product-card-modern">
      <div className="image-placeholder product-image">
        {product.imagen ? (
          <img src={product.imagen} alt={product.titulo} />
        ) : (
          <div className="mock-image modern-placeholder">
            <FontAwesomeIcon icon={faImage} />
            <span>Sin imagen</span>
          </div>
        )}

        <button
          className={`favorite-button ${favorito ? "is-favorite" : ""}`}
          type="button"
          onClick={handleFavorite}
          title="Agregar a favoritos"
        >
          <FontAwesomeIcon icon={faHeart} />
        </button>
      </div>

      <div className="product-info product-info-modern">
        <div>
          <span className="product-category-pill">
            <FontAwesomeIcon icon={faTag} />
            {product.categoria || "Sin categoría"}
          </span>

          <h3>{product.titulo}</h3>

          <p className="price">${precio}</p>

          <p className="product-meta">
            <FontAwesomeIcon icon={faLocationDot} />
            {product.ubicacion || "Sin ubicación"}
          </p>

          {product.vendedor && (
            <p className="product-meta">
              <FontAwesomeIcon icon={faUser} />
              {product.vendedor}
            </p>
          )}
        </div>

        <Link to={`/posts/${postId}`} className="small-button">
          <FontAwesomeIcon icon={faEye} />
          Ver más
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;