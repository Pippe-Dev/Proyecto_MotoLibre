import { Link, NavLink, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/authContext";
import { useCart } from "../../context/cartContext";
import { useFavorites } from "../../context/favoritesContext";
import { useTheme } from "../../context/themeContext";
import { useToast } from "../../context/toastContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link active" : "nav-link";

export function Navbar() {
  const { cartItems } = useCart();
  const { favoriteIds } = useFavorites();
  const { user, profile, loading, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const displayName = profile.nombre?.split(" ")[0] || user?.email?.split("@")[0] || "";

  const handleSignOut = async () => {
    try {
      await signOut();
      showToast("Sesión cerrada.", "info");
      navigate("/");
    } catch (caught) {
      showToast(caught instanceof Error ? caught.message : "No se pudo cerrar la sesión.", "error");
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-motor-libre">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center me-2" to="/">
          Motor Libre
        </Link>
        <button className="navbar-toggler" type="button"
                data-bs-toggle="collapse" data-bs-target="#navMenu"
                aria-controls="navMenu" aria-expanded="false"
                aria-label="Mostrar navegación">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><NavLink className={navLinkClass} to="/" end>Inicio</NavLink></li>
            <li className="nav-item"><NavLink className={navLinkClass} to="/catalogo">Tienda</NavLink></li>
            {user && (
              <li className="nav-item"><NavLink className={navLinkClass} to="/reservas">Mis reservas</NavLink></li>
            )}
            <li className="nav-item"><NavLink className={navLinkClass} to="/contacto">Contáctenos</NavLink></li>
          </ul>

          <ul className="navbar-nav align-items-lg-center">
            <li className="nav-item">
              <button
                type="button"
                className="nav-link nav-icon-btn"
                onClick={toggleTheme}
                aria-label={theme === "dark" ? "Activar modo claro" : "Activar modo oscuro"}
                title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
              >
                <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon-stars"}`} aria-hidden="true" />
              </button>
            </li>

            <li className="nav-item">
              <NavLink className={navLinkClass} to="/favoritos" aria-label="Favoritos">
                <i className="bi bi-heart" aria-hidden="true" />
                <span className="d-lg-none ms-2">Favoritos</span>
                {favoriteIds.length > 0 && (
                  <span className="cart-badge" aria-label={`${favoriteIds.length} favoritos`}>
                    {favoriteIds.length}
                  </span>
                )}
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={navLinkClass} to="/carrito">
                Carrito <i className="bi bi-cart"></i>
                {totalItems > 0 && (
                  <span
                    className="cart-badge"
                    aria-label={`${totalItems} productos en el carrito`}
                  >
                    {totalItems}
                  </span>
                )}
              </NavLink>
            </li>

            {!loading && !user && (
              <li className="nav-item ms-lg-2">
                <Link className="btn btn-accent btn-sm nav-login" to="/login">
                  <i className="bi bi-person" aria-hidden="true" /> Ingresar
                </Link>
              </li>
            )}

            {user && (
              <li className="nav-item dropdown ms-lg-2">
                <button
                  type="button"
                  className="nav-link dropdown-toggle nav-user"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="nav-user__avatar" aria-hidden="true">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                  {displayName}
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><Link className="dropdown-item" to="/perfil"><i className="bi bi-person-gear" aria-hidden="true" /> Mi perfil</Link></li>
                  <li><Link className="dropdown-item" to="/reservas"><i className="bi bi-bag-check" aria-hidden="true" /> Mis reservas</Link></li>
                  <li><Link className="dropdown-item" to="/favoritos"><i className="bi bi-heart" aria-hidden="true" /> Favoritos</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button type="button" className="dropdown-item" onClick={handleSignOut}>
                      <i className="bi bi-box-arrow-right" aria-hidden="true" /> Cerrar sesión
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
