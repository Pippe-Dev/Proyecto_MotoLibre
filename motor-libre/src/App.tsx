import { BrowserRouter, Route, Routes, Link, NavLink } from 'react-router-dom';
import './App.css'
import { HomePage } from './pages/homePage';
import { CatalogPage } from './pages/catalogPage';
import { ContactPage } from './pages/contactPage';
import { NotFoundPage } from './pages/notFoundPage';
import { ProductPage } from './pages/productDetailPage';
import { CartProvider, useCart } from './context/cartContext';
import { CartPage } from './pages/cartPage';
import { Footer } from './components/layout/footer';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? "nav-link active" : "nav-link";

export function Navbar() {
  const { cartItems } = useCart();

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

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
            <li className="nav-item"><NavLink className={navLinkClass} to="/contacto">Contáctenos</NavLink></li>
          </ul>
          <ul className="navbar-nav">
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
          </ul>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="app-shell">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/producto/:id" element={<ProductPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App
