import { useMemo, useState } from "react";
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
  faCircleInfo,
  faXmark,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useAppContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagenes, setImagenes] = useState([]);

  const [form, setForm] = useState({
    titulo: "",
    precio: "",
    categoria: "",
    ubicacion: "",
    descripcion: "",
  });

  const previews = useMemo(() => {
    return imagenes.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [imagenes]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
        file.type
      )
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Solo puedes subir imágenes JPG, PNG o WEBP.");
      e.target.value = "";
      return;
    }

    const combinedFiles = [...imagenes, ...validFiles];

    if (combinedFiles.length > 3) {
      toast.error("Puedes subir máximo 3 imágenes por publicación.");
      e.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    const hasLargeFile = combinedFiles.some((file) => file.size > maxSize);

    if (hasLargeFile) {
      toast.error("Cada imagen debe pesar máximo 5 MB.");
      e.target.value = "";
      return;
    }

    setImagenes(combinedFiles);
    e.target.value = "";
  };

  const removeImage = (indexToRemove) => {
    setImagenes((currentImages) =>
      currentImages.filter((_, index) => index !== indexToRemove)
    );
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

    if (imagenes.length === 0) {
      toast.error("Debes subir al menos una imagen del producto.");
      return;
    }

    setIsSubmitting(true);

    const result = await addPost({
      ...form,
      titulo: form.titulo.trim(),
      precio: Number(form.precio),
      ubicacion: form.ubicacion.trim(),
      descripcion: form.descripcion.trim(),
      imagenes,
    });

    setIsSubmitting(false);

    if (result.ok) {
      toast.success("Publicación creada correctamente.");
      navigate("/profile");
    } else {
      toast.error(result.message);
    }
  };

  const mainPreview = previews[0];

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
          <span>
            Ahora puedes subir imágenes reales. Máximo 3 fotos por publicación.
          </span>
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
              Imágenes del producto
            </label>

            <label className="upload-real-box">
              <FontAwesomeIcon icon={faUpload} />
              <strong>Seleccionar imágenes</strong>
              <span>JPG, PNG o WEBP. Máximo 3 imágenes de 5 MB.</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                multiple
                onChange={handleImagesChange}
              />
            </label>
          </div>

          <div className="create-preview-card">
            <div className="create-preview-image">
              {mainPreview ? (
                <img src={mainPreview.url} alt="Vista previa principal" />
              ) : (
                <div className="create-preview-placeholder">
                  <FontAwesomeIcon icon={faImage} />
                  <span>Vista previa de imagen</span>
                  <small>
                    Selecciona imágenes desde tu computador para ver cómo
                    quedará la publicación.
                  </small>
                </div>
              )}
            </div>

            {previews.length > 0 && (
              <div className="selected-images-grid">
                {previews.map((preview, index) => (
                  <div className="selected-image-item" key={preview.url}>
                    <img src={preview.url} alt={`Imagen ${index + 1}`} />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      title="Quitar imagen"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>

                    <span>{index + 1}</span>
                  </div>
                ))}
              </div>
            )}

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