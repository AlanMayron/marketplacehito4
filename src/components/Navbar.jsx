import { NavLink, Link, useNavigate } from "react-router-dom";
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
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAppContext();

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