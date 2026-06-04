/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import {
  actualizarPerfil,
  actualizarAvatarPerfil,
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
  Manualidades: 6,
  Otro: 7,
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
  estado: post.estado || "Activa",
  categoria_id: post.categoria_id || categoriasMap[post.categoria] || 1,
});

const esErrorDeToken = (message = "") => {
  const cleanMessage = message.toLowerCase();

  return (
    cleanMessage.includes("token") ||
    cleanMessage.includes("jwt") ||
    cleanMessage.includes("expirado") ||
    cleanMessage.includes("inválido") ||
    cleanMessage.includes("invalido") ||
    cleanMessage.includes("unauthorized") ||
    cleanMessage.includes("no autorizado")
  );
};

export const AppProvider = ({ children }) => {
  const sessionExpiredToastShown = useRef(false);

  const [user, setUser] = useState(() => getStorageData("user", null));
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [favoritos, setFavoritos] = useState([]);
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);

  const limpiarSesion = () => {
    setUser(null);
    setToken(null);
    setFavoritos([]);
    setMensajes([]);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const manejarError = (error) => {
    const message = error?.message || "Ocurrió un error inesperado.";

    if (esErrorDeToken(message)) {
      limpiarSesion();

      if (!sessionExpiredToastShown.current) {
        toast.error("Tu sesión expiró. Inicia sesión nuevamente.");
        sessionExpiredToastShown.current = true;
      }

      return {
        ok: false,
        message: "Tu sesión expiró. Inicia sesión nuevamente.",
        sessionExpired: true,
      };
    }

    return {
      ok: false,
      message,
      sessionExpired: false,
    };
  };

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

    try {
      const [favoritosData, mensajesData] = await Promise.all([
        getFavoritos(authToken),
        getMensajes(authToken),
      ]);

      setFavoritos(Array.isArray(favoritosData) ? favoritosData : []);
      setMensajes(Array.isArray(mensajesData) ? mensajesData : []);
    } catch (error) {
      const result = manejarError(error);

      if (!result.sessionExpired) {
        console.error("Error al cargar datos privados:", error.message);
      }
    }
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
      return manejarError(error);
    }
  };

  const login = async (email, password) => {
    try {
      const data = await loginUsuario({ email, password });

      sessionExpiredToastShown.current = false;

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
      return manejarError(error);
    }
  };

  const logout = () => {
    sessionExpiredToastShown.current = false;
    limpiarSesion();
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
      return manejarError(error);
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
    const formData = new FormData();

    formData.append("titulo", newPost.titulo);
    formData.append("descripcion", newPost.descripcion);
    formData.append("precio", Number(newPost.precio));
    formData.append("ubicacion", newPost.ubicacion);
    formData.append(
      "categoria_id",
      newPost.categoria_id || categoriasMap[newPost.categoria] || 1
    );

    if (newPost.estado) {
      formData.append("estado", newPost.estado);
    }

    if (newPost.imagen) {
      formData.append("imagen", newPost.imagen);
    }

    if (newPost.imagenes && newPost.imagenes.length > 0) {
      newPost.imagenes.forEach((file) => {
        formData.append("imagenes", file);
      });
    }

    const data = await crearPublicacion(formData, token);

    await cargarPublicaciones();

    return {
      ok: true,
      message: data.message || "Publicación creada correctamente.",
    };
  } catch (error) {
    return manejarError(error);
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
    const formData = new FormData();

    formData.append("titulo", postData.titulo);
    formData.append("descripcion", postData.descripcion);
    formData.append("precio", Number(postData.precio));
    formData.append("ubicacion", postData.ubicacion);
    formData.append(
      "categoria_id",
      postData.categoria_id || categoriasMap[postData.categoria] || 1
    );
    formData.append("estado", postData.estado || "Activa");

    if (postData.eliminarImagenes) {
      formData.append("eliminar_imagenes", "true");
    }

    if (postData.imagenes && postData.imagenes.length > 0) {
      postData.imagenes.forEach((file) => {
        formData.append("imagenes", file);
      });
    }

    const data = await actualizarPublicacion(postId, formData, token);

    await cargarPublicaciones();

    return {
      ok: true,
      message: data.message || "Publicación actualizada correctamente.",
    };
  } catch (error) {
    return manejarError(error);
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
      return manejarError(error);
    }
  };

  const favoriteIds = useMemo(() => {
    return favoritos
      .map((item) =>
        Number(
          item.publicacionId ||
            item.publicacion_id ||
            item.publicacion ||
            item.id_publicacion
        )
      )
      .filter(Boolean);
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
      return manejarError(error);
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
      return manejarError(error);
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
      return manejarError(error);
    }
  };
  const updateAvatar = async (file) => {
  if (!user || !token) {
    return {
      ok: false,
      message: "Debes iniciar sesión.",
    };
  }

  try {
    const data = await actualizarAvatarPerfil(file, token);

    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));

    return {
      ok: true,
      message: data.message || "Foto de perfil actualizada correctamente.",
    };
  } catch (error) {
    return manejarError(error);
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
        updateAvatar,
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