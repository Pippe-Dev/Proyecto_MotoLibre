import { useCart } from "../../context/cartContext";
import { CartItem } from "./cartItem";
import { CartSummary } from "./cartSummary";
import { Link } from "react-router-dom";
import "./cart.css";

const SHOP_PATH = "/carrito";

export function Cart() {
  const { cartItems } = useCart();

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-container">
          <h1 className="cart-title">TU CARRITO</h1>

          <section
            className="cart-empty"
            aria-labelledby="empty-cart-title"
          >
            <div className="cart-empty__icon" aria-hidden="true">
              🛒
            </div>

            <h2 id="empty-cart-title">
              Tu carrito está vacío
            </h2>

            <p>
              Aún no has agregado productos a tu carrito.
            </p>
            <Link to={SHOP_PATH} className="cart-continue">
              IR A LA TIENDA
            </Link>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-container">
        <h1 className="cart-title">TU CARRITO</h1>

        <div className="cart-layout">
          <section
            className="cart-products"
            aria-label="Productos del carrito"
          >
            <div
              className="cart-products__header"
              aria-hidden="true"
            >
              <span>PRODUCTO</span>
              <span>PRECIO</span>
              <span>CANTIDAD</span>
              <span>SUBTOTAL</span>
              <span />
            </div>

            <div className="cart-products__list">
              {cartItems.map((item) => (
                <CartItem
                  key={item.product.id}
                  item={item}
                />
              ))}
            </div>

            <Link to={SHOP_PATH} className="cart-continue">
              <span aria-hidden="true">←</span>
              SEGUIR COMPRANDO
            </Link>
          </section>

          <aside className="cart-summary-container">
            <CartSummary cartItems={cartItems} />
          </aside>
        </div>
      </div>
    </main>
  );
}