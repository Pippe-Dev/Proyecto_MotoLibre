import { useCart } from "../../context/cartContext";
import { CartItem } from "./cartItem";
import { CartSummary } from "./cartSummary";

export function Cart() {

  const { cartItems } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="container mt-4">
        <h1>Carrito</h1>

        <p>
          Tu carrito está vacío.
        </p>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      <h1>Carrito</h1>

      <div className="row">

        <div className="col-md-8">

          {cartItems.map(item => (
            <CartItem
              key={item.product.id}
              item={item}
            />
          ))}

        </div>

        <div className="col-md-4">

          <CartSummary
            cartItems={cartItems}
          />

        </div>

      </div>

    </div>
  );
}