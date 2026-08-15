interface QuantitySelectorProps {
  stock: number;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export function QuantitySelector({
  stock,
  quantity,
  onQuantityChange
}: QuantitySelectorProps) {

  const decreaseQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < stock) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <div className="align-items-center quantity-selector">

      <button
        className="quantity-btn"
        onClick={decreaseQuantity}
      >
        -
      </button>

      <span className="quantity-value">{quantity}</span>

      <button
        className="quantity-btn"
        onClick={increaseQuantity}
      >
        +
      </button>

    </div>
  );
}