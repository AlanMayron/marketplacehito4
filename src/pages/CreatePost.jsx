import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoriasMock } from "../data/mockData";
import { useAppContext } from "../context/AppContext";

const CreatePost = () => {
  const navigate = useNavigate();
  const { addPost } = useAppContext();

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

    const result = await addPost({
      ...form,
      precio: Number(form.precio),
    });

    if (result.ok) {
      navigate("/profile");
    } else {
      alert(result.message);
    }
  };

  return (
    <section className="panel create-post-panel">
      <h1 className="page-title">Nueva publicación</h1>
      <p className="subtitle-left">
        Ingresa los datos del producto que quieres vender
      </p>

      <form className="create-form-grid" onSubmit={handleSubmit}>
        <div>
          <div className="form-group">
            <label>Título</label>
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
            <label>Precio</label>
            <input
              type="number"
              name="precio"
              placeholder="Ej: 250000"
              value={form.precio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Categoría</label>
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
            <label>Ubicación</label>
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
            <label>Imagen del producto</label>
            <div className="upload-box">
              Arrastrar imagen o seleccionar archivo
            </div>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              name="descripcion"
              placeholder="Describe estado, características y detalles..."
              value={form.descripcion}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn-primary full-button" type="submit">
            Publicar producto
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreatePost;