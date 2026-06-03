import { NavLink, Link } from "react-router-dom";
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

const Navbar = () => {
  const { isAuthenticated, logout } = useAppContext();

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
          <button className="nav-button" onClick={logout}>
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