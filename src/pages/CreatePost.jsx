import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  faImage,
  faLink,
  faCircleInfo,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useAppContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviewError, setImagePreviewError] = useState(false);

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

    if (e.target.name === "imagen") {
      setImagePreviewError(false);
    }
  };

  const clearImage = () => {
    setForm({
      ...form,
      imagen: "",
    });

    setImagePreviewError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.titulo.trim().length < 3) {
      toast.error("El título debe tener al menos 3 caracteres.");
      return;
    }

    if (Number(form.precio) <= 0) {
      toast.error("El precio debe ser mayor a 0.");
      return;
    }

    if (form.categoria === "") {
      toast.error("Debes seleccionar una categoría.");
      return;
    }

    if (form.ubicacion.trim().length < 3) {
      toast.error("La ubicación debe tener al menos 3 caracteres.");
      return;
    }

    if (form.descripcion.trim().length < 10) {
      toast.error("La descripción debe tener al menos 10 caracteres.");
      return;
    }

    setIsSubmitting(true);

    const result = await addPost({
      ...form,
      titulo: form.titulo.trim(),
      precio: Number(form.precio),
      ubicacion: form.ubicacion.trim(),
      descripcion: form.descripcion.trim(),
      imagen: form.imagen.trim(),
    });

    setIsSubmitting(false);

    if (result.ok) {
      toast.success("Publicación creada correctamente.");
      navigate("/profile");
    } else {
      toast.error(result.message);
    }
  };

  const hasImageUrl = form.imagen.trim() !== "";

  return (
    <section className="panel create-post-panel create-post-panel-modern">
      <div className="create-post-header">
        <div>
          <h1 className="page-title">
            <FontAwesomeIcon icon={faPenToSquare} />
            Nueva publicación
          </h1>

          <p className="subtitle-left">
            Ingresa los datos del producto que quieres vender
          </p>
        </div>

        <div className="create-post-helper">
          <FontAwesomeIcon icon={faCircleInfo} />
          <span>Mientras agregamos Cloudinary, puedes usar una URL de imagen.</span>
        </div>
      </div>

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

            <small className="char-counter">
              {form.descripcion.length}/500 caracteres
            </small>
          </div>
        </div>

        <div>
          <div className="form-group">
            <label className="label-with-icon">
              <FontAwesomeIcon icon={faCamera} />
              Imagen del producto
            </label>

            <div className="image-url-box">
              <FontAwesomeIcon icon={faLink} />
              <input
                type="url"
                name="imagen"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={form.imagen}
                onChange={handleChange}
              />

              {hasImageUrl && (
                <button
                  type="button"
                  className="clear-image-button"
                  onClick={clearImage}
                  title="Quitar imagen"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              )}
            </div>
          </div>

          <div className="create-preview-card">
            <div className="create-preview-image">
              {hasImageUrl && !imagePreviewError ? (
                <img
                  src={form.imagen}
                  alt="Vista previa"
                  onError={() => setImagePreviewError(true)}
                />
              ) : (
                <div className="create-preview-placeholder">
                  <FontAwesomeIcon icon={faImage} />
                  <span>
                    {hasImageUrl
                      ? "No se pudo cargar la imagen"
                      : "Vista previa de imagen"}
                  </span>
                  <small>
                    Pega una URL válida para ver cómo quedará tu publicación.
                  </small>
                </div>
              )}
            </div>

            <div className="create-preview-info">
              <span className="product-category-pill">
                <FontAwesomeIcon icon={faTag} />
                {form.categoria || "Categoría"}
              </span>

              <h3>{form.titulo || "Título de la publicación"}</h3>

              <p className="preview-price">
                ${Number(form.precio || 0).toLocaleString("es-CL")}
              </p>

              <p className="product-meta">
                <FontAwesomeIcon icon={faLocationDot} />
                {form.ubicacion || "Ubicación"}
              </p>

              <p className="preview-description">
                {form.descripcion ||
                  "Aquí se mostrará una vista resumida de la descripción del producto."}
              </p>
            </div>
          </div>

          <button
            className="btn-primary full-button create-submit-button"
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