import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <article className="product-card">
      <div className="image-placeholder">
        {product.imagen ? (
          <img src={product.imagen} alt={product.titulo} />
        ) : (
          <div className="mock-image">
            <div className="mock-mountain"></div>
            <div className="mock-circle"></div>
          </div>
        )}
      </div>

      <div className="product-info">
        <div>
          <h3>{product.titulo}</h3>
          <p className="price">${product.precio.toLocaleString("es-CL")}</p>
          <p className="category">{product.categoria}</p>
        </div>

        <Link to={`/posts/${product.id}`} className="small-button">
          Ver más
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;