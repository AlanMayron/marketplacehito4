/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  actualizarPerfil,
  actualizarPublicacion,
  agregarFavorito,
  crearPublicacion,
  crearUsuario,
  eliminarPublicacion,
  enviarMensaje,
  getFavoritos,
  getMensajes,
  getPublicaciones,
  loginUsuario,
  quitarFavorito,
  responderMensaje,
} from "../services/api";

const AppContext = createContext();

const categoriasMap = {
  Tecnología: 1,
  Ropa: 2,
  Hogar: 3,
  Deportes: 4,
  Libros: 5,
};

const getStorageData = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const normalizarPostParaApi = (post) => ({
  titulo: post.titulo,
  descripcion: post.descripcion,
  precio: Number(post.precio),
  imagen: post.imagen || "",
  ubicacion: post.ubicacion,
  estado: post.estado,
  categoria_id: post.categoria_id || categoriasMap[post.categoria] || 1,
});

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStorageData("user", null));
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarPublicaciones = async () => {
    const data = await getPublicaciones();
    setPublicaciones(Array.isArray(data) ? data : []);
  };

  const cargarDatosPrivados = async (authToken = token) => {
    if (!authToken) {
      setFavoritos([]);
      setMensajes([]);
      return;
    }

    const [favoritosData, mensajesData] = await Promise.all([
      getFavoritos(authToken),
      getMensajes(authToken),
    ]);

    setFavoritos(Array.isArray(favoritosData) ? favoritosData : []);
    setMensajes(Array.isArray(mensajesData) ? mensajesData : []);
  };

  const cargarTodo = async () => {
    try {
      setLoading(true);
      await cargarPublicaciones();
      await cargarDatosPrivados(token);
    } catch (error) {
      console.error("Error al cargar datos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const register = async (newUser) => {
    try {
      await crearUsuario(newUser);

      return {
        ok: true,
        message: "Usuario creado correctamente. Ahora puedes iniciar sesión.",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  const login = async (email, password) => {
    try {
      const data = await loginUsuario({ email, password });

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);

      await cargarPublicaciones();
      await cargarDatosPrivados(data.token);

      return {
        ok: true,
        message: "Inicio de sesión correcto.",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setFavoritos([]);
    setMensajes([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const updateProfile = async (profileData) => {
    if (!token) {
      return {
        ok: false,
        message: "Debes iniciar sesión.",
      };
    }

    try {
      const data = await actualizarPerfil(profileData, token);
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      await cargarPublicaciones();
      await cargarDatosPrivados(token);

      return {
        ok: true,
        message: data.message || "Perfil actualizado correctamente.",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  const addPost = async (newPost) => {
    if (!user || !token) {
      return {
        ok: false,
        message: "Debes iniciar sesión para crear una publicación.",
      };
    }

    try {
      const data = await crearPublicacion(normalizarPostParaApi(newPost), token);
      await cargarPublicaciones();

      return {
        ok: true,
        message: data.message || "Publicación creada correctamente.",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  const updatePost = async (postId, postData) => {
    if (!user || !token) {
      return {
        ok: false,
        message: "Debes iniciar sesión.",
      };
    }

    try {
      const data = await actualizarPublicacion(
        postId,
        normalizarPostParaApi(postData),
        token
      );
      await cargarPublicaciones();

      return {
        ok: true,
        message: data.message || "Publicación actualizada correctamente.",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  const deletePost = async (postId) => {
    if (!user || !token) {
      return {
        ok: false,
        message: "Debes iniciar sesión.",
      };
    }

    try {
      const data = await eliminarPublicacion(postId, token);
      await cargarPublicaciones();
      await cargarDatosPrivados(token);

      return {
        ok: true,
        message: data.message || "Publicación eliminada correctamente.",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  const favoriteIds = useMemo(() => {
    return favoritos.map((item) => Number(item.publicacionId));
  }, [favoritos]);

  const isFavorite = (postId) => favoriteIds.includes(Number(postId));

  const toggleFavorito = async (postId) => {
    if (!user || !token) {
      return {
        ok: false,
        message: "Debes iniciar sesión para usar favoritos.",
      };
    }

    const alreadyExists = isFavorite(postId);

    try {
      const data = alreadyExists
        ? await quitarFavorito(postId, token)
        : await agregarFavorito(postId, token);

      await cargarDatosPrivados(token);

      return {
        ok: true,
        message:
          data.message ||
          (alreadyExists
            ? "Publicación quitada de favoritos."
            : "Publicación agregada a favoritos."),
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  const addMessage = async ({ publicacionId, mensaje }) => {
    if (!user || !token) {
      return {
        ok: false,
        message: "Debes iniciar sesión para contactar al vendedor.",
      };
    }

    if (!mensaje || mensaje.trim() === "") {
      return {
        ok: false,
        message: "El mensaje no puede estar vacío.",
      };
    }

    try {
      const data = await enviarMensaje(
        {
          publicacion_id: publicacionId,
          mensaje: mensaje.trim(),
        },
        token
      );

      await cargarDatosPrivados(token);

      return {
        ok: true,
        message: data.message || "Mensaje enviado correctamente.",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  const addReply = async ({ mensajeId, respuesta }) => {
    if (!user || !token) {
      return {
        ok: false,
        message: "Debes iniciar sesión para responder.",
      };
    }

    if (!respuesta || respuesta.trim() === "") {
      return {
        ok: false,
        message: "La respuesta no puede estar vacía.",
      };
    }

    try {
      const data = await responderMensaje(mensajeId, respuesta.trim(), token);
      await cargarDatosPrivados(token);

      return {
        ok: true,
        message: data.message || "Respuesta enviada correctamente.",
      };
    } catch (error) {
      return {
        ok: false,
        message: error.message,
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        publicaciones,
        favoritos,
        favoriteIds,
        mensajes,
        loading,
        refreshData: cargarTodo,
        register,
        login,
        logout,
        updateProfile,
        addPost,
        updatePost,
        deletePost,
        toggleFavorito,
        isFavorite,
        addMessage,
        addReply,
        isAuthenticated: Boolean(token),
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
