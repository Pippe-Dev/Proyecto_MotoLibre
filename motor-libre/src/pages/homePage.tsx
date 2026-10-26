import { Link } from "react-router-dom";
import heroImg from "../assets/motor-libre.png";
import { HeroCarousel } from "../components/home/heroCarousel";

export function HomePage() {
  return (
    <main>
      <section className="hero">
        <HeroCarousel />
        <img
          className="hero__logo"
          src={heroImg}
          width="140"
          height="140"
          alt="Motor Libre"
        />
        <h1 className="hero__title">Motor Libre</h1>
        <p className="hero__text">
          Accesorios y protección para tu moto. Reserva en línea y
          paga al recoger en tienda.
        </p>
        <Link className="btn-accent" to="/catalogo">
          Ver tienda
        </Link>
      </section>

      <div className="container">
        <div className="benefit-cards">
          <div className="benefit-card">
            <i className="bi bi-clock" aria-hidden="true"></i>
            <div>
              <strong>Pago en tienda</strong>
              <span>Recoge y paga cuando llegues</span>
            </div>
          </div>

          <div className="benefit-card">
            <i className="bi bi-patch-check" aria-hidden="true"></i>
            <div>
              <strong>Garantía de calidad</strong>
              <span>Productos certificados</span>
            </div>
          </div>

          <div className="benefit-card">
            <i className="bi bi-chat-left-text" aria-hidden="true"></i>
            <div>
              <strong>¿Tienes dudas?</strong>
              <span>Contáctanos</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
