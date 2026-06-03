/* eslint-disable react-hooks/set-state-in-effect */
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { categoriasMock } from "../data/mockData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen,
  faCalendarDays,
  faDollarSign,
  faEnvelope,
  faFloppyDisk,
  faHeart,
  faImage,
  faLocationDot,
  faMessage,
  faPen,
  faPhone,
  faPlus,
  faTag,
  faTrash,
  faUser,
  faUserGear,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

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

  const userId = user?.id || user?.usuario_id;

  const myPosts = publicaciones.filter((post) => {
    const postUserId =
      post.usuarioId || post.usuario_id || post.user_id || post.vendedor_id;

    return Number(postUserId) === Number(userId);
  });

  const receivedMessages = mensajes.filter((mensaje) => {
    const vendedorId =
      mensaje.vendedorId || mensaje.vendedor_id || mensaje.usuario_vendedor_id;

    return Number(vendedorId) === Number(userId);
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
    const message = "El nombre no puede estar vacío.";
    setError(message);
    toast.error(message);
    return;
  }

  if (profileForm.email.trim() === "") {
    const message = "El correo no puede estar vacío.";
    setError(message);
    toast.error(message);
    return;
  }

  if (profileForm.telefono.trim() === "") {
    const message = "El teléfono no puede estar vacío.";
    setError(message);
    toast.error(message);
    return;
  }

  const result = await updateProfile({
    nombre: profileForm.nombre.trim(),
    email: profileForm.email.trim(),
    telefono: profileForm.telefono.trim(),
  });

  if (!result.ok) {
    setError(result.message);
    setSuccess("");
    toast.error(result.message);
    return;
  }

  setSuccess(result.message);
  setError("");
  toast.success(result.message);
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
    const postId = post.id || post.publicacion_id;

    setEditingPostId(postId);
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
    const message = "El título no puede estar vacío.";
    setError(message);
    toast.error(message);
    return;
  }

  if (Number(postForm.precio) <= 0) {
    const message = "El precio debe ser mayor a 0.";
    setError(message);
    toast.error(message);
    return;
  }

  if (postForm.categoria === "") {
    const message = "Debes seleccionar una categoría.";
    setError(message);
    toast.error(message);
    return;
  }

  if (postForm.ubicacion.trim() === "") {
    const message = "La ubicación no puede estar vacía.";
    setError(message);
    toast.error(message);
    return;
  }

  if (postForm.descripcion.trim() === "") {
    const message = "La descripción no puede estar vacía.";
    setError(message);
    toast.error(message);
    return;
  }

  const result = await updatePost(editingPostId, {
    titulo: postForm.titulo.trim(),
    precio: Number(postForm.precio),
    categoria: postForm.categoria,
    ubicacion: postForm.ubicacion.trim(),
    descripcion: postForm.descripcion.trim(),
    estado: postForm.estado,
  });

  if (!result.ok) {
    setError(result.message);
    setSuccess("");
    toast.error(result.message);
    return;
  }

  setSuccess(result.message);
  setError("");
  toast.success(result.message);
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
    setSuccess("");
    toast.error(result.message);
    return;
  }

  setSuccess(result.message);
  setError("");
  toast.success(result.message);

  if (editingPostId === postId) {
    setEditingPostId(null);
  }
};

  return (
    <section className="profile-page-modern">
      <aside className="profile-sidebar-modern">
        <div className="panel profile-card-modern">
          <div className="profile-cover"></div>

          <div className="profile-avatar-modern">
            <FontAwesomeIcon icon={faUser} />
          </div>

          {!isEditingProfile ? (
            <>
              <h2>{user?.nombre || "Usuario Marketplace"}</h2>

              <p className="profile-main-email">
                <FontAwesomeIcon icon={faEnvelope} />
                {user?.email}
              </p>

              <p className="profile-main-email">
                <FontAwesomeIcon icon={faPhone} />
                {user?.telefono || "Sin teléfono"}
              </p>

              <button
                className="btn-primary full-button"
                type="button"
                onClick={() => setIsEditingProfile(true)}
              >
                <FontAwesomeIcon icon={faUserGear} />
                Editar perfil
              </button>
            </>
          ) : (
            <form className="profile-edit-form-modern" onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faUser} />
                  Nombre
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={profileForm.nombre}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faEnvelope} />
                  Correo
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  <FontAwesomeIcon icon={faPhone} />
                  Teléfono
                </label>
                <input
                  type="text"
                  name="telefono"
                  value={profileForm.telefono}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <button className="btn-primary full-button" type="submit">
                <FontAwesomeIcon icon={faFloppyDisk} />
                Guardar cambios
              </button>

              <button
                className="btn-light full-button"
                type="button"
                onClick={handleCancelProfile}
              >
                <FontAwesomeIcon icon={faXmark} />
                Cancelar
              </button>
            </form>
          )}
        </div>

        <div className="panel profile-stats-modern">
          <h3>Resumen</h3>

          <div className="profile-stat-item">
            <FontAwesomeIcon icon={faBoxOpen} />
            <div>
              <strong>{myPosts.length}</strong>
              <span>Publicaciones</span>
            </div>
          </div>

          <div className="profile-stat-item">
            <FontAwesomeIcon icon={faHeart} />
            <div>
              <strong>{favoriteIds.length}</strong>
              <span>Favoritos</span>
            </div>
          </div>

          <div className="profile-stat-item">
            <FontAwesomeIcon icon={faMessage} />
            <div>
              <strong>{receivedMessages.length}</strong>
              <span>Mensajes recibidos</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="panel profile-content-modern">
        <div className="profile-content-header">
          <div>
            <h1>Mis publicaciones</h1>
            <p>Administra tus productos publicados en el marketplace.</p>
          </div>

          <Link to="/create-post" className="btn-primary">
            <FontAwesomeIcon icon={faPlus} />
            Crear nueva
          </Link>
        </div>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {myPosts.length === 0 ? (
          <div className="empty-home">
            <FontAwesomeIcon icon={faBoxOpen} />
            <h3>Aún no tienes publicaciones</h3>
            <p>Crea tu primera publicación para comenzar a vender.</p>

            <Link to="/create-post" className="btn-primary">
              <FontAwesomeIcon icon={faPlus} />
              Crear publicación
            </Link>
          </div>
        ) : (
          <div className="profile-posts-list">
            {myPosts.map((post) => {
              const postId = post.id || post.publicacion_id;

              return (
                <article className="profile-post-card" key={postId}>
                  <div className="profile-post-image">
                    {post.imagen ? (
                      <img src={post.imagen} alt={post.titulo} />
                    ) : (
                      <FontAwesomeIcon icon={faImage} />
                    )}
                  </div>

                  <div className="profile-post-info">
                    <div className="profile-post-top">
                      <span
                        className={
                          post.estado === "Activa"
                            ? "status-pill status-active-modern"
                            : "status-pill status-paused-modern"
                        }
                      >
                        {post.estado || "Activa"}
                      </span>

                      <span className="profile-post-date">
                        <FontAwesomeIcon icon={faCalendarDays} />
                        {post.fecha || "Reciente"}
                      </span>
                    </div>

                    <h3>{post.titulo}</h3>

                    <p className="profile-post-price">
                      <FontAwesomeIcon icon={faDollarSign} />
                      {Number(post.precio || 0).toLocaleString("es-CL")}
                    </p>

                    <div className="profile-post-meta">
                      <span>
                        <FontAwesomeIcon icon={faTag} />
                        {post.categoria || "Sin categoría"}
                      </span>

                      <span>
                        <FontAwesomeIcon icon={faLocationDot} />
                        {post.ubicacion || "Sin ubicación"}
                      </span>
                    </div>
                  </div>

                  <div className="profile-post-actions">
                    <Link to={`/posts/${postId}`} className="small-button">
                      Ver
                    </Link>

                    <button type="button" onClick={() => startEditPost(post)}>
                      <FontAwesomeIcon icon={faPen} />
                      Editar
                    </button>

                    <button
                      type="button"
                      className="delete-action"
                      onClick={() => handleDeletePost(postId)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {editingPostId && (
          <form className="edit-post-panel edit-post-panel-modern" onSubmit={handlePostSubmit}>
            <div className="edit-post-header">
              <div>
                <h2>Editar publicación</h2>
                <p>Actualiza los datos principales de tu producto.</p>
              </div>

              <button
                className="btn-light"
                type="button"
                onClick={() => setEditingPostId(null)}
              >
                <FontAwesomeIcon icon={faXmark} />
                Cerrar
              </button>
            </div>

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
              <FontAwesomeIcon icon={faFloppyDisk} />
              Guardar publicación
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Profile;