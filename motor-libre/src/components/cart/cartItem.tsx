import type { CartItem as CartItemType } from "../../types/cart";
import { useCart } from "../../context/cartContext";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {

  const {
    updateQuantity,
    removeFromCart
  } = useCart();

  const subtotal =
    item.product.price * item.quantity;

  const increaseQuantity = () => {

    updateQuantity(
      item.product.id,
      item.quantity + 1
    );

  };

  const decreaseQuantity = () => {

    if (item.quantity > 1) {

      updateQuantity(
        item.product.id,
        item.quantity - 1
      );

    }

  };

  return (
    <div className="cart-item">

      <img
        src={item.product.image}
        alt={item.product.name}
      />

      <div>

        <h3>
          {item.product.name}
        </h3>

        <p>
          $
          {item.product.price.toLocaleString("es-CO")}
        </p>

        <div>

          <button onClick={decreaseQuantity}>
            -
          </button>

          <span>
            {item.quantity}
          </span>

          <button onClick={increaseQuantity}>
            +
          </button>

        </div>

        <p>
          Subtotal: $
          {subtotal.toLocaleString("es-CO")}
        </p>

        <button
          onClick={() =>
            removeFromCart(item.product.id)
          }
        >
          Eliminar
        </button>

      </div>

    </div>
  );
}