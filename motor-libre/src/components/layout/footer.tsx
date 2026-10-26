import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__inner">
          <div>
            <strong>Motor Libre</strong>
            <span>Accesorios y protección para tu moto.</span>
          </div>

          <div>
            <strong>Navegación</strong>
            <Link to="/catalogo">Tienda</Link>
            <Link to="/carrito">Carrito</Link>
            <Link to="/contacto">Contáctenos</Link>
          </div>

          <div>
            <strong>Compra</strong>
            <span>Pago y recogida en tienda.</span>
          </div>
        </div>

        <p className="site-footer__copy">
          © {new Date().getFullYear()} Motor Libre. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
