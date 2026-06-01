import { NavLink, Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const { isAuthenticated, logout } = useAppContext();

  return (
    <nav className="market-navbar">
      <Link to="/" className="brand">
        MarketPlace Local
      </Link>

      <div className="nav-links">
        <NavLink to="/">Inicio</NavLink>
        <NavLink to="/posts">Publicaciones</NavLink>

        {isAuthenticated && (
          <>
            <NavLink to="/create-post">Crear</NavLink>
            <NavLink to="/profile">Perfil</NavLink>
            <NavLink to="/favorites">Favoritos</NavLink>
            <NavLink to="/messages">Mensajes</NavLink>
          </>
        )}

        {isAuthenticated ? (
          <button className="nav-button" onClick={logout}>
            Salir
          </button>
        ) : (
          <>
            <NavLink to="/register">Registro</NavLink>
            <NavLink to="/login">Login</NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;