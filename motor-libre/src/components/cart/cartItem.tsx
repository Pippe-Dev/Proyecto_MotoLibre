import type { CartItem as CartItemType } from "../../types/cart";
import { useCart } from "../../context/cartContext";

interface CartItemProps {
  item: CartItemType;
}

const formatPrice = (price: number): string =>
  price.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart();

  const { product, quantity } = item;

  const subtotal = product.price * quantity;

  const hasStock = product.stock > 0;
  const isMinimumQuantity = quantity <= 1;
  const isMaximumQuantity =
    hasStock && quantity >= product.stock;

  const increaseQuantity = (): void => {
    if (!hasStock || isMaximumQuantity) {
      return;
    }

    updateQuantity(product.id, quantity + 1);
  };

  const decreaseQuantity = (): void => {
    if (isMinimumQuantity) {
      return;
    }

    updateQuantity(product.id, quantity - 1);
  };

  const handleRemove = (): void => {
    removeFromCart(product.id);
  };

  return (
    <article className="cart-item">
      <div className="cart-item__product">
        <div className="cart-item__image-container">
          {product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="cart-item__image"
            />
          ) : (
            <div className="cart-item__image-placeholder">
              Imagen no disponible
            </div>
          )}
        </div>

        <div className="cart-item__information">
          <h2 className="cart-item__name">
            {product.name}
          </h2>

          {!hasStock && (
            <span className="cart-item__stock-warning">
              Producto sin existencias
            </span>
          )}
        </div>
      </div>

      <div className="cart-item__cell cart-item__price">
        <span className="cart-item__mobile-label">
          Precio
        </span>

        <span>{formatPrice(product.price)}</span>
      </div>

      <div className="cart-item__cell">
        <span className="cart-item__mobile-label">
          Cantidad
        </span>

        <div
          className="quantity-control"
          aria-label={`Cantidad de ${product.name}`}
        >
          <button
            type="button"
            className="quantity-control__button"
            onClick={decreaseQuantity}
            disabled={isMinimumQuantity}
            aria-label={`Disminuir cantidad de ${product.name}`}
          >
            −
          </button>

          <span
            className="quantity-control__value"
            aria-live="polite"
          >
            {quantity}
          </span>

          <button
            type="button"
            className="quantity-control__button"
            onClick={increaseQuantity}
            disabled={!hasStock || isMaximumQuantity}
            aria-label={`Aumentar cantidad de ${product.name}`}
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-item__cell cart-item__subtotal">
        <span className="cart-item__mobile-label">
          Subtotal
        </span>

        <strong>{formatPrice(subtotal)}</strong>
      </div>

      <div className="cart-item__remove-container">
        <button
          type="button"
          className="cart-item__remove"
          onClick={handleRemove}
          aria-label={`Eliminar ${product.name} del carrito`}
          title="Eliminar producto"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path
              d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </article>
  );
}