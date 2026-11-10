import { Link } from "react-router-dom";

import type { Product } from "../../types/detailedProduct";
import { useFavorites } from "../../context/favoritesContext";
import { useToast } from "../../context/toastContext";

export function ProductCard({ product }: { product: Product }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { showToast } = useToast();
  const favorite = isFavorite(product.id);

  const handleFavorite = (event: React.MouseEvent) => {
    // El botón está dentro del enlace de la tarjeta: no debe navegar.
    event.preventDefault();
    event.stopPropagation();

    const added = toggleFavorite(product.id);
    showToast(
      added ? "Añadido a favoritos" : "Eliminado de favoritos",
      added ? "success" : "info"
    );
  };

  return (
    <Link
      to={`/producto/${product.id}`}
      className={
        product.stock === 0
          ? "product-card product-card--soldout"
          : "product-card"
      }
    >
      <div className="product-card__image">
        <img
          src={product.images[0] || "/images/sin-imagen.svg"}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/images/sin-imagen.svg";
          }}
        />

        <button
          type="button"
          className={favorite ? "favorite-btn favorite-btn--active" : "favorite-btn"}
          onClick={handleFavorite}
          aria-pressed={favorite}
          aria-label={
            favorite
              ? `Quitar ${product.name} de favoritos`
              : `Añadir ${product.name} a favoritos`
          }
        >
          <i className={`bi ${favorite ? "bi-heart-fill" : "bi-heart"}`} aria-hidden="true" />
        </button>
      </div>

      <div className="product-card__body">
        <h2 className="product-card__name">{product.name}</h2>
        <p className="product-card__price">
          ${product.price.toLocaleString("es-CO")}
        </p>
        {product.stock === 0 && (
          <span className="product-card__tag">Agotado</span>
        )}
        {product.stock > 0 && product.stock <= 3 && (
          <span className="product-card__tag product-card__tag--low">
            ¡Últimas {product.stock} unidades!
          </span>
        )}
      </div>
    </Link>
  );
}
