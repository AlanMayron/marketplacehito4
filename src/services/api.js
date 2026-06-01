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

export const crearPublicacion = (publicacion, token) =>
  request("/publicaciones", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(publicacion),
  });

export const actualizarPublicacion = (id, publicacion, token) =>
  request(`/publicaciones/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(publicacion),
  });

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
