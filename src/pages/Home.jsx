import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { categoriasMock } from "../data/mockData";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faStore,
  faShieldHeart,
  faBolt,
  faPlus,
  faArrowRight,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  const navigate = useNavigate();
  const { publicaciones, isAuthenticated } = useAppContext();
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

  const ultimasPublicaciones = publicaciones.slice(0, 4);

  return (
    <>
      <section className="hero hero-modern">
        <div className="hero-content">
          <span className="hero-badge">
            <FontAwesomeIcon icon={faStore} />
            Marketplace local en producción
          </span>

          <h1>Compra y vende productos de forma simple y segura</h1>

          <p>
            Encuentra publicaciones de tecnología, ropa, hogar, deportes y más.
            Publica tus productos, guarda favoritos y contacta vendedores desde
            una sola plataforma.
          </p>

          <form className="hero-search" onSubmit={handleSearch}>
            <div className="hero-search-box">
              <FontAwesomeIcon icon={faMagnifyingGlass} />
              <input
                type="text"
                placeholder="Buscar productos, categorías o ubicación..."
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
              />
            </div>

            <button className="btn-primary" type="submit">
              Buscar
            </button>

            <Link to="/posts" className="btn-secondary">
              Ver publicaciones
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </form>

          <div className="hero-stats">
            <div>
              <strong>{publicaciones.length}</strong>
              <span>Publicaciones</span>
            </div>

            <div>
              <strong>{categoriasMock.length}</strong>
              <span>Categorías</span>
            </div>

            <div>
              <strong>Online</strong>
              <span>Netlify + Render</span>
            </div>
          </div>
        </div>

        <div className="hero-side-card">
          <div className="hero-side-icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>

          <h3>Publica en minutos</h3>

          <p>
            Crea una publicación con título, precio, ubicación, categoría e
            imagen referencial.
          </p>

          <Link
            to={isAuthenticated ? "/create-post" : "/login"}
            className="btn-primary full-button"
          >
            <FontAwesomeIcon icon={faPlus} />
            Crear publicación
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Categorías destacadas</h2>
            <p>Explora productos según lo que estás buscando.</p>
          </div>
        </div>

        <div className="categories-grid">
          {categoriasMock.map((category) => (
            <CategoryCard key={category} name={category} />
          ))}
        </div>
      </section>

      <section className="benefits-grid">
        <div className="benefit-card">
          <FontAwesomeIcon icon={faBolt} />
          <h3>Rápido</h3>
          <p>Publica y encuentra productos sin complicaciones.</p>
        </div>

        <div className="benefit-card">
          <FontAwesomeIcon icon={faShieldHeart} />
          <h3>Confiable</h3>
          <p>Usuarios registrados, favoritos y contacto directo.</p>
        </div>

        <div className="benefit-card">
          <FontAwesomeIcon icon={faStore} />
          <h3>Local</h3>
          <p>Filtra por categoría, precio y ubicación.</p>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Últimas publicaciones</h2>
            <p>Productos agregados recientemente por la comunidad.</p>
          </div>

          <Link to="/posts" className="section-link">
            Ver todas
            <FontAwesomeIcon icon={faArrowRight} />
          </Link>
        </div>

        {ultimasPublicaciones.length === 0 ? (
          <div className="empty-home">
            <FontAwesomeIcon icon={faBoxOpen} />
            <h3>Aún no hay publicaciones</h3>
            <p>Crea la primera publicación del marketplace.</p>

            <Link
              to={isAuthenticated ? "/create-post" : "/login"}
              className="btn-primary"
            >
              Crear publicación
            </Link>
          </div>
        ) : (
          <div className="products-grid home-products">
            {ultimasPublicaciones.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

export default Home;