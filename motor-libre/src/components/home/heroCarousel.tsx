import { useEffect, useState } from "react";

const SLIDES = [
  "/images/honda/protector-honda-xr.jpg",
  "/images/honda/slider-honda-xr.jpg",
  "/images/honda/Pechera.webp",
];

const INTERVAL_MS = 5000;

/*
 * Carrusel decorativo de fondo para el hero. Las imágenes se
 * oscurecen con una capa morada desde CSS para que el texto
 * y el logo mantengan el contraste.
 */
export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % SLIDES.length);
    }, INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hero-carousel" aria-hidden="true">
      {SLIDES.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={
            index === active
              ? "hero-carousel__slide hero-carousel__slide--active"
              : "hero-carousel__slide"
          }
        />
      ))}

      <div className="hero-carousel__overlay" />

      <div className="hero-carousel__dots">
        {SLIDES.map((src, index) => (
          <span
            key={src}
            className={
              index === active
                ? "hero-carousel__dot hero-carousel__dot--active"
                : "hero-carousel__dot"
            }
          />
        ))}
      </div>
    </div>
  );
}
