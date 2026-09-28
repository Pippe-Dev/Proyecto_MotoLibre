import type { CartItem } from "../../types/cart";

interface CartSummaryProps {
  cartItems: CartItem[];
}

const formatPrice = (price: number): string =>
  price.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

export function CartSummary({
  cartItems,
}: CartSummaryProps) {
  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  const shipping = 0;
  const total = subtotal + shipping;

  const hasUnavailableProducts = cartItems.some(
    ({ product, quantity }) =>
      product.stock <= 0 || quantity > product.stock
  );

  return (
    <section
      className="cart-summary"
      aria-labelledby="cart-summary-title"
    >
      <h2
        id="cart-summary-title"
        className="cart-summary__title"
      >
        RESUMEN DEL PEDIDO
      </h2>

      <div className="cart-summary__details">
        <div className="cart-summary__row">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="cart-summary__row">
          <span>Envío (en tienda)</span>
          <span>{formatPrice(shipping)}</span>
        </div>
      </div>

      <div className="cart-summary__total">
        <strong>TOTAL</strong>
        <strong>{formatPrice(total)}</strong>
      </div>

      {hasUnavailableProducts && (
        <p
          className="cart-summary__warning"
          role="alert"
        >
          Revisa las cantidades del carrito antes de continuar.
        </p>
      )}

      <button
        type="button"
        className="cart-summary__checkout"
        disabled={hasUnavailableProducts}
      >
        FINALIZAR PEDIDO
      </button>

      <p className="cart-summary__note">
        <span aria-hidden="true">*</span>
        El pago se realiza en tienda al momento de recoger.
      </p>
    </section>
  );
}