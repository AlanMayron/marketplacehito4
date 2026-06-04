import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faStore,
  faPlus,
  faUser,
  faHeart,
  faEnvelope,
  faRightToBracket,
  faUserPlus,
  faRightFromBracket,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout, mensajes } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);

  const mensajesList = Array.isArray(mensajes) ? mensajes : [];
  const totalNotifications = mensajesList.length;
  const latestNotifications = mensajesList.slice(0, 4);

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada correctamente.");
    navigate("/", { replace: true });
  };

  return (
    <nav className="market-navbar">
      <Link to="/" className="brand">
        <span className="brand-icon">M</span>
        <span>MarketPlace Local</span>
      </Link>

      <div className="nav-links">
        <NavLink to="/">
          <FontAwesomeIcon icon={faHouse} />
          Inicio
        </NavLink>

        <NavLink to="/posts">
          <FontAwesomeIcon icon={faStore} />
          Publicaciones
        </NavLink>

        {isAuthenticated && (
          <>
            <NavLink to="/create-post">
              <FontAwesomeIcon icon={faPlus} />
              Crear
            </NavLink>

            <NavLink to="/profile">
              <FontAwesomeIcon icon={faUser} />
              Perfil
            </NavLink>

            <NavLink to="/favorites">
              <FontAwesomeIcon icon={faHeart} />
              Favoritos
            </NavLink>

            <NavLink to="/messages">
              <FontAwesomeIcon icon={faEnvelope} />
              Mensajes
            </NavLink>

            <div className="notifications-wrapper">
              <button
                className="notification-button"
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notificaciones"
              >
                <FontAwesomeIcon icon={faBell} />

                {totalNotifications > 0 && (
                  <span className="notification-badge">
                    {totalNotifications > 9 ? "9+" : totalNotifications}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notifications-header">
                    <strong>Notificaciones</strong>
                    <span>{totalNotifications}</span>
                  </div>

                  {latestNotifications.length === 0 ? (
                    <div className="notification-empty">
                      No tienes notificaciones nuevas.
                    </div>
                  ) : (
                    <div className="notifications-list">
                      {latestNotifications.map((mensaje, index) => (
                        <Link
                          to="/messages"
                          className="notification-item"
                          key={mensaje.id || mensaje.mensaje_id || index}
                          onClick={() => setShowNotifications(false)}
                        >
                          <FontAwesomeIcon icon={faEnvelope} />

                          <div>
                            <strong>
                              {mensaje.remitente ||
                                mensaje.comprador ||
                                mensaje.nombre ||
                                "Nuevo mensaje"}
                            </strong>

                            <p>
                              {mensaje.mensaje ||
                                mensaje.contenido ||
                                "Tienes un mensaje sobre una publicación."}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <Link
                    to="/messages"
                    className="notifications-footer"
                    onClick={() => setShowNotifications(false)}
                  >
                    Ver todos los mensajes
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {isAuthenticated ? (
          <button className="nav-button" onClick={handleLogout}>
            <FontAwesomeIcon icon={faRightFromBracket} />
            Salir
          </button>
        ) : (
          <>
            <NavLink to="/register">
              <FontAwesomeIcon icon={faUserPlus} />
              Registro
            </NavLink>

            <NavLink to="/login">
              <FontAwesomeIcon icon={faRightToBracket} />
              Login
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;