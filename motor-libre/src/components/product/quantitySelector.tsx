import { useState } from "react";

interface QuantitySelectorProps {
  stock: number;
}

export function QuantitySelector({ stock }: QuantitySelectorProps) {

  const [quantity, setQuantity] = useState(1);

  const increase = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="align-items-center quantity-selector">

      <button
        className="quantity-btn"
        onClick={decrease}
      >
        -
      </button>

      <span className="quantity-value">{quantity}</span>

      <button
        className="quantity-btn"
        onClick={increase}
      >
        +
      </button>

    </div>
  );
}