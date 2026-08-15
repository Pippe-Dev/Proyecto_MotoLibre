import heroImg from './assets/motor-libre.png'
import { BrowserRouter, Route, Routes} from 'react-router-dom';
import './App.css'
import { ProductPage } from './pages/productDetailPage';
import { CartProvider } from './context/cartContext';

export interface NavbarProps {
  brands: string[];    // lista de marcas de motos disponibles
}

export function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg" style={{ backgroundColor: "#5E24C3" }}>
      <div className="container">
        <a className="navbar-brand d-flex align-items-center me-2" href="/">Motor Libre</a>
        <button className="navbar-toggler" type="button" 
                data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto">
            <li className="nav-item"><a className="nav-link" href="/">Inicio</a></li>
            <li className="nav-item"><a className="nav-link" href="/catalogo">Tienda</a></li>
            <li className="nav-item"><a className="nav-link" href="/contacto">Contáctenos</a></li>
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link" href="/carrito">
                Carrito <i className="bi bi-cart"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}



function App() {

  return (
    <>
    <CartProvider>
    <Navbar/>
      <section className="hero">
        <div className="hero">
          <img src={heroImg} className="hero" width="100" height="100" alt="" />
        </div>
      </section>
       <BrowserRouter>
          <Routes>

            <Route path="/producto/:id" element={<ProductPage />} />

          </Routes>
        </BrowserRouter>
        </CartProvider>
    </>
  )
}

export default App
