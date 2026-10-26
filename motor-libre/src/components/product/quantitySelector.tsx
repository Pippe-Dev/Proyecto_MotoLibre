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
        type="button"
        aria-label="Disminuir cantidad"
        className="quantity-btn"
        onClick={decreaseQuantity}
      >
        -
      </button>

      <span className="quantity-value">{quantity}</span>

      <button
        type="button"
        aria-label="Aumentar cantidad"
        className="quantity-btn"
        onClick={increaseQuantity}
      >
        +
      </button>

    </div>
  );
}