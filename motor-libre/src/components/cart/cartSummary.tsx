import type { CartItem } from "../../types/cart";

interface CartSummaryProps {
  cartItems: CartItem[];
}

export function CartSummary({
  cartItems
}: CartSummaryProps) {

  const total = cartItems.reduce(
    (sum, item) =>
      sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="cart-summary">

      <h2>Resumen</h2>

      <p>
        Total:
      </p>

      <h3>
        ${total.toLocaleString("es-CO")}
      </h3>

      <button className="btn btn-primary">
        RESERVAR
      </button>

    </div>
  );
}