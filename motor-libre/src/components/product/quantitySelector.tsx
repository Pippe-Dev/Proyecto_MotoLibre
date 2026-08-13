import { useState } from "react";

export function QuantitySelector() {

  const [quantity, setQuantity] = useState(1);

  const increase = () => {
    setQuantity(quantity + 1);
  };

  const decrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="d-flex align-items-center gap-2">

      <button
        className="btn btn-outline-secondary"
        onClick={decrease}
      >
        -
      </button>

      <span>{quantity}</span>

      <button
        className="btn btn-outline-secondary"
        onClick={increase}
      >
        +
      </button>

    </div>
  );
}