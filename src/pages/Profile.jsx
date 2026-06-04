/* eslint-disable react-hooks/set-state-in-effect */
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
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
  faUpload,
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
    updateAvatar,
    updatePost,
    deletePost,
  } = useAppContext();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [editImages, setEditImages] = useState([]);
  const [removeCurrentImages, setRemoveCurrentImages] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

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

  const publicacionesList = Array.isArray(publicaciones) ? publicaciones : [];
  const mensajesList = Array.isArray(mensajes) ? mensajes : [];
  const favoritosList = Array.isArray(favoriteIds) ? favoriteIds : [];

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

  const myPosts = publicacionesList.filter((post) => {
    const postUserId =
      post.usuarioId || post.usuario_id || post.user_id || post.vendedor_id;

    return Number(postUserId) === Number(userId);
  });

  const receivedMessages = mensajesList.filter((mensaje) => {
    const vendedorId =
      mensaje.vendedorId || mensaje.vendedor_id || mensaje.usuario_vendedor_id;

    return Number(vendedorId) === Number(userId);
  });

  const editingPost = publicacionesList.find((post) => {
    const postId = post.id || post.publicacion_id;
    return Number(postId) === Number(editingPostId);
  });

  const currentImages = useMemo(() => {
    if (!editingPost) {
      return [];
    }

    if (Array.isArray(editingPost.imagenes) && editingPost.imagenes.length > 0) {
      return editingPost.imagenes
        .map((img, index) => ({
          id: img.id || index,
          url: img.url || img.imagen_url || img.imagenUrl || "",
          orden: img.orden || index + 1,
        }))
        .filter((img) => img.url);
    }

    if (editingPost.imagen) {
      return [
        {
          id: "principal",
          url: editingPost.imagen,
          orden: 1,
        },
      ];
    }

    return [];
  }, [editingPost]);

  const editImagePreviews = useMemo(() => {
    return editImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [editImages]);

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
    setAvatarFile(null);
    setAvatarPreview("");

    setProfileForm({
      nombre: user?.nombre || "",
      email: user?.email || "",
      telefono: user?.telefono || "",
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Solo puedes subir imágenes JPG, PNG o WEBP.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("La foto de perfil debe pesar máximo 5 MB.");
      e.target.value = "";
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarSubmit = async () => {
    if (!avatarFile) {
      toast.error("Selecciona una imagen primero.");
      return;
    }

    if (!updateAvatar) {
      toast.error("La función para actualizar avatar no está disponible.");
      return;
    }

    setIsUploadingAvatar(true);

    const result = await updateAvatar(avatarFile);

    setIsUploadingAvatar(false);

    if (!result.ok) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const cancelAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const startEditPost = (post) => {
    const postId = post.id || post.publicacion_id;

    setEditingPostId(postId);
    setError("");
    setSuccess("");
    setEditImages([]);
    setRemoveCurrentImages(false);

    setPostForm({
      titulo: post.titulo || "",
      precio: post.precio || "",
      categoria: post.categoria || "",
      ubicacion: post.ubicacion || "",
      descripcion: post.descripcion || "",
      estado: post.estado || "Activa",
    });
  };

  const cancelEditPost = () => {
    setEditingPostId(null);
    setEditImages([]);
    setRemoveCurrentImages(false);
    setError("");
    setSuccess("");
  };

  const handlePostChange = (e) => {
    setPostForm({
      ...postForm,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleEditImagesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) {
      return;
    }

    const validFiles = selectedFiles.filter((file) =>
      ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error("Solo puedes subir imágenes JPG, PNG o WEBP.");
      e.target.value = "";
      return;
    }

    const combinedFiles = [...editImages, ...validFiles];

    const baseImagesCount = removeCurrentImages ? 0 : currentImages.length;
    const totalImages = baseImagesCount + combinedFiles.length;

    if (totalImages > 3) {
      toast.error("Puedes tener máximo 3 imágenes por publicación.");
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

    setEditImages(combinedFiles);
    e.target.value = "";
  };

  const removeEditImage = (indexToRemove) => {
    setEditImages((currentImagesState) =>
      currentImagesState.filter((_, index) => index !== indexToRemove)
    );
  };

  const removeAllCurrentImages = () => {
    setRemoveCurrentImages(true);
    setEditImages([]);
  };

  const restoreCurrentImages = () => {
    setRemoveCurrentImages(false);
    setEditImages([]);
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
      imagenes: editImages,
      eliminarImagenes: removeCurrentImages,
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
    setEditImages([]);
    setRemoveCurrentImages(false);
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

    if (Number(editingPostId) === Number(postId)) {
      setEditingPostId(null);
      setEditImages([]);
      setRemoveCurrentImages(false);
    }
  };

  return (
    <section className="profile-page-modern">
      <aside className="profile-sidebar-modern">
        <div className="panel profile-card-modern">
          <div className="profile-cover"></div>

          <div className="profile-avatar-modern">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Vista previa perfil" />
            ) : user?.avatar_url || user?.avatarUrl ? (
              <img src={user.avatar_url || user.avatarUrl} alt={user.nombre} />
            ) : (
              <FontAwesomeIcon icon={faUser} />
            )}
          </div>

          {isEditingProfile && (
            <div className="avatar-upload-panel">
              <label className="avatar-upload-button">
                <FontAwesomeIcon icon={faUpload} />
                Cambiar foto
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleAvatarChange}
                />
              </label>

              {avatarFile && (
                <div className="avatar-actions">
                  <button
                    className="btn-primary full-button"
                    type="button"
                    onClick={handleAvatarSubmit}
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? "Subiendo..." : "Guardar foto"}
                  </button>

                  <button
                    className="btn-light full-button"
                    type="button"
                    onClick={cancelAvatarPreview}
                  >
                    Cancelar foto
                  </button>
                </div>
              )}
            </div>
          )}

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
            <form
              className="profile-edit-form-modern"
              onSubmit={handleProfileSubmit}
            >
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
              <strong>{favoritosList.length}</strong>
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
                      <img
                        src={post.imagen}
                        alt={post.titulo}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.parentElement.classList.add(
                            "image-load-error"
                          );
                        }}
                      />
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
          <form
            className="edit-post-panel edit-post-panel-modern"
            onSubmit={handlePostSubmit}
          >
            <div className="edit-post-header">
              <div>
                <h2>Editar publicación</h2>
                <p>Actualiza los datos principales de tu producto.</p>
              </div>

              <button
                className="btn-light"
                type="button"
                onClick={cancelEditPost}
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
              </div>

              <div>
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
                  <label>Imágenes</label>

                  <div className="edit-current-images">
                    {!removeCurrentImages && (
                      <>
                        <p>Imágenes actuales</p>

                        {currentImages.length > 0 ? (
                          <div className="selected-images-grid">
                            {currentImages.map((img, index) => (
                              <div
                                className="selected-image-item"
                                key={img.id || img.url}
                              >
                                <img src={img.url} alt={`Imagen ${index + 1}`} />
                                <span>{index + 1}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="edit-image-preview">
                            <span>Sin imágenes actuales</span>
                          </div>
                        )}

                        {currentImages.length > 0 && (
                          <button
                            type="button"
                            className="btn-light full-button"
                            onClick={removeAllCurrentImages}
                          >
                            Quitar imágenes actuales
                          </button>
                        )}
                      </>
                    )}

                    {removeCurrentImages && editImages.length === 0 && (
                      <div className="edit-image-preview">
                        <span>
                          Las imágenes actuales serán eliminadas al guardar.
                        </span>
                      </div>
                    )}

                    {removeCurrentImages && currentImages.length > 0 && (
                      <button
                        type="button"
                        className="btn-light full-button"
                        onClick={restoreCurrentImages}
                      >
                        Restaurar imágenes actuales
                      </button>
                    )}
                  </div>

                  <label className="upload-real-box edit-upload-box">
                    <FontAwesomeIcon icon={faUpload} />
                    <strong>Seleccionar nuevas imágenes</strong>
                    <span>
                      Puedes agregar nuevas imágenes hasta completar 3 fotos.
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      multiple
                      onChange={handleEditImagesChange}
                    />
                  </label>

                  {editImagePreviews.length > 0 && (
                    <div className="selected-images-grid">
                      {editImagePreviews.map((preview, index) => (
                        <div className="selected-image-item" key={preview.url}>
                          <img
                            src={preview.url}
                            alt={`Nueva imagen ${index + 1}`}
                          />

                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            title="Quitar imagen"
                          >
                            <FontAwesomeIcon icon={faXmark} />
                          </button>

                          <span>{index + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
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