/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import ProductCard from "../components/ProductCard";
import { categoriasMock } from "../data/mockData";

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

  const filteredPosts = publicaciones.filter((post) => {
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

  return (
    <section className="posts-layout">
      <aside className="filter-panel">
        <h1>Filtros</h1>

        <div className="form-group">
          <label>Buscar</label>
          <input
            type="text"
            name="buscar"
            value={filters.buscar}
            onChange={handleChange}
            placeholder="Ej: notebook"
          />
        </div>

        <div className="form-group">
          <label>Categoría</label>
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
          <label>Precio mínimo</label>
          <input
            type="number"
            name="precioMin"
            value={filters.precioMin}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label>Precio máximo</label>
          <input
            type="number"
            name="precioMax"
            value={filters.precioMax}
            onChange={handleChange}
            placeholder="300000"
          />
        </div>

        <div className="form-group">
          <label>Ubicación</label>
          <input
            type="text"
            name="ubicacion"
            value={filters.ubicacion}
            onChange={handleChange}
            placeholder="Santiago"
          />
        </div>

        <button
          className="btn-secondary full-button"
          type="button"
          onClick={handleApplyFilters}
        >
          Aplicar filtros
        </button>

        <button
          className="btn-light full-button filter-clear"
          type="button"
          onClick={handleClearFilters}
        >
          Limpiar filtros
        </button>
      </aside>

      <div className="panel posts-panel">
        <div className="posts-header">
          <h1>Publicaciones disponibles</h1>
          <span>{filteredPosts.length} resultados</span>
        </div>

        {filteredPosts.length === 0 ? (
          <p className="empty-state">No se encontraron publicaciones.</p>
        ) : (
          <div className="products-grid">
            {filteredPosts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="pagination">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <strong>Siguiente</strong>
        </div>
      </div>
    </section>
  );
};

export default Posts;