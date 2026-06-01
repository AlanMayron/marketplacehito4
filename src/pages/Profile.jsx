/* eslint-disable react-hooks/set-state-in-effect */
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { categoriasMock } from "../data/mockData";

const Profile = () => {
  const {
    user,
    publicaciones,
    favoriteIds,
    mensajes,
    updateProfile,
    updatePost,
    deletePost,
  } = useAppContext();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  const [postForm, setPostForm] = useState({
    titulo: "",
    precio: "",
    categoria: "",
    ubicacion: "",
    descripcion: "",
    estado: "Activa",
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        nombre: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
      });
    }
  }, [user]);

  const myPosts = publicaciones.filter((post) => {
    return Number(post.usuarioId) === Number(user?.id);
  });

  const receivedMessages = mensajes.filter((mensaje) => {
    return Number(mensaje.vendedorId) === Number(user?.id);
  });

  const handleProfileChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (profileForm.nombre.trim() === "") {
      setError("El nombre no puede estar vacío.");
      return;
    }

    if (profileForm.email.trim() === "") {
      setError("El correo no puede estar vacío.");
      return;
    }

    if (profileForm.telefono.trim() === "") {
      setError("El teléfono no puede estar vacío.");
      return;
    }

    const result = await updateProfile({
      nombre: profileForm.nombre.trim(),
      email: profileForm.email.trim(),
      telefono: profileForm.telefono.trim(),
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);
    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
    setError("");
    setSuccess("");

    setProfileForm({
      nombre: user?.nombre || "",
      email: user?.email || "",
      telefono: user?.telefono || "",
    });
  };

  const startEditPost = (post) => {
    setEditingPostId(post.id);
    setError("");
    setSuccess("");

    setPostForm({
      titulo: post.titulo || "",
      precio: post.precio || "",
      categoria: post.categoria || "",
      ubicacion: post.ubicacion || "",
      descripcion: post.descripcion || "",
      estado: post.estado || "Activa",
    });
  };

  const handlePostChange = (e) => {
    setPostForm({
      ...postForm,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (postForm.titulo.trim() === "") {
      setError("El título no puede estar vacío.");
      return;
    }

    if (Number(postForm.precio) <= 0) {
      setError("El precio debe ser mayor a 0.");
      return;
    }

    if (postForm.categoria === "") {
      setError("Debes seleccionar una categoría.");
      return;
    }

    if (postForm.ubicacion.trim() === "") {
      setError("La ubicación no puede estar vacía.");
      return;
    }

    if (postForm.descripcion.trim() === "") {
      setError("La descripción no puede estar vacía.");
      return;
    }

    const result = await updatePost(editingPostId, {
      titulo: postForm.titulo.trim(),
      precio: postForm.precio,
      categoria: postForm.categoria,
      ubicacion: postForm.ubicacion.trim(),
      descripcion: postForm.descripcion.trim(),
      estado: postForm.estado,
    });

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);
    setEditingPostId(null);
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm(
      "¿Seguro que quieres eliminar esta publicación?"
    );

    if (!confirmDelete) {
      return;
    }

    const result = await deletePost(postId);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess(result.message);

    if (editingPostId === postId) {
      setEditingPostId(null);
    }
  };

  return (
    <section className="profile-layout">
      <aside className="panel profile-card">
        <div className="avatar"></div>

        {!isEditingProfile ? (
          <>
            <h2>{user?.nombre}</h2>
            <p>{user?.email}</p>
            <p>{user?.telefono}</p>

            <button
              className="btn-primary full-button"
              type="button"
              onClick={() => setIsEditingProfile(true)}
            >
              Editar perfil
            </button>
          </>
        ) : (
          <form className="profile-edit-form" onSubmit={handleProfileSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={profileForm.nombre}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Correo</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Teléfono</label>
              <input
                type="text"
                name="telefono"
                value={profileForm.telefono}
                onChange={handleProfileChange}
                required
              />
            </div>

            <button className="btn-primary full-button" type="submit">
              Guardar cambios
            </button>

            <button
              className="btn-light full-button filter-clear"
              type="button"
              onClick={handleCancelProfile}
            >
              Cancelar
            </button>
          </form>
        )}

        <div className="summary-list">
          <h3>Resumen</h3>
          <p>Publicaciones activas: {myPosts.length}</p>
          <p>Favoritos: {favoriteIds.length}</p>
          <p>Mensajes recibidos: {receivedMessages.length}</p>
        </div>
      </aside>

      <div className="panel my-posts">
        <div className="posts-header">
          <h1>Mis publicaciones</h1>
          <Link to="/create-post" className="btn-primary">
            Crear nueva
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {myPosts.length === 0 ? (
          <p className="empty-state">Aún no tienes publicaciones creadas.</p>
        ) : (
          myPosts.map((post) => (
            <div className="post-row" key={post.id}>
              <div className="row-image"></div>

              <div>
                <h3>{post.titulo}</h3>
                <p>${Number(post.precio).toLocaleString("es-CL")}</p>
              </div>

              <strong
                className={
                  post.estado === "Activa" ? "status-active" : "status-paused"
                }
              >
                {post.estado}
              </strong>

              <div className="row-actions">
                <button type="button" onClick={() => startEditPost(post)}>
                  Editar
                </button>
                <span>|</span>
                <button type="button" onClick={() => handleDeletePost(post.id)}>
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}

        {editingPostId && (
          <form className="edit-post-panel" onSubmit={handlePostSubmit}>
            <h2>Editar publicación</h2>

            <div className="create-form-grid">
              <div>
                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    name="titulo"
                    value={postForm.titulo}
                    onChange={handlePostChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    name="precio"
                    value={postForm.precio}
                    onChange={handlePostChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    name="categoria"
                    value={postForm.categoria}
                    onChange={handlePostChange}
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
              </div>

              <div>
                <div className="form-group">
                  <label>Ubicación</label>
                  <input
                    type="text"
                    name="ubicacion"
                    value={postForm.ubicacion}
                    onChange={handlePostChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Estado</label>
                  <select
                    name="estado"
                    value={postForm.estado}
                    onChange={handlePostChange}
                  >
                    <option value="Activa">Activa</option>
                    <option value="Pausada">Pausada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Descripción</label>
                  <textarea
                    name="descripcion"
                    value={postForm.descripcion}
                    onChange={handlePostChange}
                    required
                  />
                </div>
              </div>
            </div>

            <button className="btn-primary" type="submit">
              Guardar publicación
            </button>

            <button
              className="btn-light edit-cancel"
              type="button"
              onClick={() => setEditingPostId(null)}
            >
              Cancelar edición
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Profile;