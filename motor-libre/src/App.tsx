import heroImg from './assets/motor-libre.png'
import { BrowserRouter, Route, Routes, Link} from 'react-router-dom';
import './App.css'
import { ProductPage } from './pages/productDetailPage';
import { CartProvider } from './context/cartContext';
import { CartPage } from './pages/cartPage';

export interface NavbarProps {
  brands: string[];    // lista de marcas de motos disponibles
}

export function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#5E24C3" }}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center me-2" to="/">
          Motor Libre
        </Link>
        <button className="navbar-toggler" type="button" 
                data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/catalogo">Tienda</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/contacto">Contáctenos</Link></li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/carrito">
                Carrito <i className="bi bi-cart"></i>
              </Link>
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

        <Navbar />

        <section className="hero">
          <div className="hero">
            <img
              src={heroImg}
              className="hero"
              width="100"
              height="100"
              alt=""
            />
          </div>
        </section>

        <Routes>

          <Route
            path="/producto/:id"
            element={<ProductPage />}
          />

          <Route
            path="/carrito"
            element={<CartPage />}
          />

        </Routes>

      </CartProvider>

    </BrowserRouter>
  );
}

export default App
