const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error en la solicitud");
  }

  return data;
};

const authHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const getPublicaciones = () => request("/publicaciones");

export const getPublicacionById = (id) => request(`/publicaciones/${id}`);

export const loginUsuario = (credentials) =>
  request("/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

export const crearUsuario = (usuario) =>
  request("/usuarios", {
    method: "POST",
    body: JSON.stringify(usuario),
  });

export const obtenerPerfil = (token) =>
  request("/perfil", {
    headers: authHeaders(token),
  });

export const actualizarPerfil = (perfil, token) =>
  request("/perfil", {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(perfil),
  });

export const crearPublicacion = async (publicacion, token) => {
  const isFormData = publicacion instanceof FormData;

  const response = await fetch(`${API_URL}/publicaciones`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? publicacion : JSON.stringify(publicacion),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error al crear publicación");
  }

  return data;
};

export const actualizarPublicacion = async (id, publicacion, token) => {
  const isFormData = publicacion instanceof FormData;

  const response = await fetch(`${API_URL}/publicaciones/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData ? publicacion : JSON.stringify(publicacion),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar publicación");
  }

  return data;
};

export const eliminarPublicacion = (id, token) =>
  request(`/publicaciones/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

export const getFavoritos = (token) =>
  request("/favoritos", {
    headers: authHeaders(token),
  });

export const agregarFavorito = (publicacionId, token) =>
  request(`/favoritos/${publicacionId}`, {
    method: "POST",
    headers: authHeaders(token),
  });

export const quitarFavorito = (publicacionId, token) =>
  request(`/favoritos/${publicacionId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

export const getMensajes = (token) =>
  request("/mensajes", {
    headers: authHeaders(token),
  });

export const enviarMensaje = (mensaje, token) =>
  request("/mensajes", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(mensaje),
  });

export const responderMensaje = (mensajeId, respuesta, token) =>
  request(`/mensajes/${mensajeId}/respuestas`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ respuesta }),
  });

  export const actualizarAvatarPerfil = async (file, token) => {
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_URL}/perfil/avatar`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Error al actualizar foto de perfil");
  }

  return data;
};
