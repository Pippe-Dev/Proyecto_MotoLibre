import { Link } from "react-router-dom";

import { CONTACT_ITEMS } from "../constants/contactInfo";

const STEPS = [
  "Elige tus productos en la tienda y agrégalos al carrito.",
  "Reserva con tus datos: tu documento te servirá para consultar la reserva.",
  "Pasa por la tienda a confirmarla, pagarla y recoger tus productos.",
];

export function ContactPage() {
  return (
    <main className="container py-4 contact-page">
      <h1 className="page-title">Contáctenos</h1>
      <p className="contact-page__intro">
        Los pedidos se pagan y recogen en tienda. Para cualquier duda sobre un
        producto o una reserva, escríbenos o visítanos.
      </p>

      <ul className="contact-cards" role="list">
        {CONTACT_ITEMS.map((item) => (
          <li className="contact-card" key={item.label}>
            <i className={`bi ${item.icon} contact-card__icon`} aria-hidden="true" />
            <div>
              <span className="contact-card__label">{item.label}</span>
              {item.href ? (
                <a className="contact-card__value" href={item.href}>
                  {item.value}
                </a>
              ) : (
                <span className="contact-card__value">{item.value}</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <section className="contact-steps" aria-labelledby="contact-steps-title">
        <h2 id="contact-steps-title" className="contact-steps__title">
          ¿Cómo funciona la reserva?
        </h2>
        <ol className="contact-steps__list">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <div className="contact-steps__actions">
          <Link to="/catalogo" className="btn btn-primary">
            Ver la tienda
          </Link>
          <Link to="/reservas" className="btn btn-outline-primary">
            Consultar mi reserva
          </Link>
        </div>
      </section>
    </main>
  );
}
