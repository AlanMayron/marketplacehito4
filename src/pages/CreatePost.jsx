import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoriasMock } from "../data/mockData";
import { useAppContext } from "../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faPenToSquare,
  faDollarSign,
  faTag,
  faLocationDot,
  faPlus,
  faHeading,
  faAlignLeft,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useAppContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    titulo: "",
    precio: "",
    categoria: "",
    ubicacion: "",
    descripcion: "",
    imagen: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(form.precio) <= 0) {
      alert("El precio debe ser mayor a 0.");
      return;
    }

    setIsSubmitting(true);

    const result = await addPost({
      ...form,
      precio: Number(form.precio),
      imagen: form.imagen.trim(),
    });

    setIsSubmitting(false);

    if (result.ok) {
      navigate("/profile");
    } else {
      alert(result.message);
    }
  };

  return (
    <section className="panel create-post-panel">
      <h1 className="page-title">
        <FontAwesomeIcon icon={faPenToSquare} />
        Nueva publicación
      </h1>

      <p className="subtitle-left">
        Ingresa los datos del producto que quieres vender
      </p>

      <form className="create-form-grid" onSubmit={handleSubmit}>
        <div>
          <div className="form-group">
            <label className="label-with-icon">
              <FontAwesomeIcon icon={faHeading} />
              Título
            </label>
            <input
              type="text"
              name="titulo"
              placeholder="Ej: Notebook Lenovo ThinkPad"
              value={form.titulo}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="label-with-icon">
              <FontAwesomeIcon icon={faDollarSign} />
              Precio
            </label>
            <input
              type="number"
              name="precio"
              placeholder="Ej: 250000"
              value={form.precio}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="label-with-icon">
              <FontAwesomeIcon icon={faTag} />
              Categoría
            </label>
            <select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categoriasMock.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="label-with-icon">
              <FontAwesomeIcon icon={faLocationDot} />
              Ubicación
            </label>
            <input
              type="text"
              name="ubicacion"
              placeholder="Ej: Santiago Centro"
              value={form.ubicacion}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <div className="form-group">
            <label className="label-with-icon">
              <FontAwesomeIcon icon={faCamera} />
              Imagen del producto
            </label>

            <div className="upload-box">
              <div className="upload-box-content">
                <FontAwesomeIcon icon={faCamera} />
                <span>Agrega una imagen referencial</span>
                <small>
                  Por ahora puedes pegar una URL de imagen. Luego lo cambiamos a
                  carga real con Cloudinary.
                </small>
              </div>

              <input
                type="url"
                name="imagen"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={form.imagen}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label-with-icon">
              <FontAwesomeIcon icon={faAlignLeft} />
              Descripción
            </label>
            <textarea
              name="descripcion"
              placeholder="Describe estado, características y detalles..."
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="btn-primary full-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin />
                Publicando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} />
                Publicar producto
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;