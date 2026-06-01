import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { categoriasMock } from "../data/mockData";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";

const Home = () => {
  const navigate = useNavigate();
  const { publicaciones } = useAppContext();
  const [buscar, setBuscar] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    const cleanSearch = buscar.trim();

    if (cleanSearch === "") {
      navigate("/posts");
      return;
    }

    navigate(`/posts?buscar=${encodeURIComponent(cleanSearch)}`);
  };

  return (
    <>
      <section className="hero">
        <div>
          <h1>Compra y vende productos de forma simple</h1>
          <p>
            Encuentra publicaciones de tecnología, ropa, hogar, deportes y más
            dentro de un marketplace local simple y rápido.
          </p>

          <form className="hero-actions" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar productos, categorías o ubicación..."
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />

            <button className="btn-primary" type="submit">
              Buscar
            </button>

            <Link to="/posts" className="btn-secondary">
              Ver publicaciones
            </Link>
          </form>
        </div>
      </section>

      <section className="section-block">
        <h2>Categorías destacadas</h2>

        <div className="categories-grid">
          {categoriasMock.map((category) => (
            <CategoryCard key={category} name={category} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2>Últimas publicaciones</h2>

        <div className="products-grid home-products">
          {publicaciones.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Home;