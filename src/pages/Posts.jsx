/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { categoriasMock } from "../data/mockData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faTag,
  faLocationDot,
  faDollarSign,
  faBroom,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

const Posts = () => {
  const { publicaciones } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    buscar: "",
    categoria: "",
    precioMin: "",
    precioMax: "",
    ubicacion: "",
  });

  useEffect(() => {
    setFilters({
      buscar: searchParams.get("buscar") || "",
      categoria: searchParams.get("categoria") || "",
      precioMin: searchParams.get("precioMin") || "",
      precioMax: searchParams.get("precioMax") || "",
      ubicacion: searchParams.get("ubicacion") || "",
    });
  }, [searchParams]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleApplyFilters = () => {
    const precioMin = Number(filters.precioMin);
    const precioMax = Number(filters.precioMax);

    if (
      filters.precioMin !== "" &&
      filters.precioMax !== "" &&
      precioMin > precioMax
    ) {
      alert("El precio mínimo no puede ser mayor al precio máximo.");
      return;
    }

    const params = {};

    if (filters.buscar.trim() !== "") {
      params.buscar = filters.buscar.trim();
    }

    if (filters.categoria !== "") {
      params.categoria = filters.categoria;
    }

    if (filters.precioMin !== "") {
      params.precioMin = filters.precioMin;
    }

    if (filters.precioMax !== "") {
      params.precioMax = filters.precioMax;
    }

    if (filters.ubicacion.trim() !== "") {
      params.ubicacion = filters.ubicacion.trim();
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setFilters({
      buscar: "",
      categoria: "",
      precioMin: "",
      precioMax: "",
      ubicacion: "",
    });

    setSearchParams({});
  };

  const filteredPosts = useMemo(() => {
    return publicaciones.filter((post) => {
      const titulo = post.titulo || "";
      const descripcion = post.descripcion || "";
      const categoria = post.categoria || "";
      const ubicacion = post.ubicacion || "";
      const precio = Number(post.precio) || 0;

      const textToSearch = `${titulo} ${descripcion} ${categoria} ${ubicacion}`;

      const matchBuscar =
        filters.buscar === "" ||
        textToSearch.toLowerCase().includes(filters.buscar.toLowerCase());

      const matchCategoria =
        filters.categoria === "" || categoria === filters.categoria;

      const matchPrecioMin =
        filters.precioMin === "" || precio >= Number(filters.precioMin);

      const matchPrecioMax =
        filters.precioMax === "" || precio <= Number(filters.precioMax);

      const matchUbicacion =
        filters.ubicacion === "" ||
        ubicacion.toLowerCase().includes(filters.ubicacion.toLowerCase());

      return (
        matchBuscar &&
        matchCategoria &&
        matchPrecioMin &&
        matchPrecioMax &&
        matchUbicacion
      );
    });
  }, [publicaciones, filters]);

  return (
    <section className="posts-layout">
      <aside className="filter-panel filter-panel-modern">
        <h1 className="filter-title">
          <FontAwesomeIcon icon={faFilter} />
          Filtros
        </h1>

        <div className="form-group">
          <label className="label-with-icon">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
            Buscar
          </label>
          <input
            type="text"
            name="buscar"
            value={filters.buscar}
            onChange={handleChange}
            placeholder="Ej: notebook"
          />
        </div>

        <div className="form-group">
          <label className="label-with-icon">
            <FontAwesomeIcon icon={faTag} />
            Categoría
          </label>
          <select
            name="categoria"
            value={filters.categoria}
            onChange={handleChange}
          >
            <option value="">Todas</option>
            {categoriasMock.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="label-with-icon">
            <FontAwesomeIcon icon={faDollarSign} />
            Precio mínimo
          </label>
          <input
            type="number"
            name="precioMin"
            value={filters.precioMin}
            onChange={handleChange}
            placeholder="0"
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="label-with-icon">
            <FontAwesomeIcon icon={faDollarSign} />
            Precio máximo
          </label>
          <input
            type="number"
            name="precioMax"
            value={filters.precioMax}
            onChange={handleChange}
            placeholder="300000"
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="label-with-icon">
            <FontAwesomeIcon icon={faLocationDot} />
            Ubicación
          </label>
          <input
            type="text"
            name="ubicacion"
            value={filters.ubicacion}
            onChange={handleChange}
            placeholder="Santiago"
          />
        </div>

        <div className="filter-actions">
          <button
            className="btn-secondary full-button"
            type="button"
            onClick={handleApplyFilters}
          >
            <FontAwesomeIcon icon={faFilter} />
            Aplicar filtros
          </button>

          <button
            className="btn-light full-button filter-clear"
            type="button"
            onClick={handleClearFilters}
          >
            <FontAwesomeIcon icon={faBroom} />
            Limpiar filtros
          </button>
        </div>
      </aside>

      <div className="panel posts-panel posts-panel-modern">
        <div className="posts-header">
          <div>
            <h1>Publicaciones disponibles</h1>
            <p className="subtitle-left">
              Encuentra productos publicados por otros usuarios
            </p>
          </div>

          <span>{filteredPosts.length} resultados</span>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="empty-home">
            <FontAwesomeIcon icon={faBoxOpen} />
            <h3>No se encontraron publicaciones</h3>
            <p>Prueba limpiando los filtros o creando una nueva publicación.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredPosts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Posts;