import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";

const Favorites = () => {
  const { publicaciones, favoriteIds } = useAppContext();

  const favoritePosts = publicaciones.filter((post) =>
    favoriteIds.includes(post.id)
  );

  return (
    <section className="panel">
      <h1 className="page-title">Mis favoritos</h1>

      {favoritePosts.length === 0 ? (
        <p className="empty-state">Aún no tienes publicaciones favoritas.</p>
      ) : (
        <div className="products-grid">
          {favoritePosts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Favorites;