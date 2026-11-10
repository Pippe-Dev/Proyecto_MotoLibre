import { useEffect, useRef, useState } from "react";

import type { Product } from "../../types/detailedProduct";

import { QuantitySelector } from "./quantitySelector";
import { useRequireLogin } from "../../hooks/useRequireLogin";
import { ReservationModal } from "./reservationModal";
import { useCart } from "../../context/cartContext";

import "./styles/productDetailStyles.css";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {

  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReservation, setShowReservation] = useState(false);
  const requireLogin = useRequireLogin();

  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current);
  }, []);

  const handleAddToCart = () => {
    const added = addToCart(product, quantity);

    if (added) {
      setShowSuccess(true);

      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setShowSuccess(false);
      }, 2500);
    }
  };

  if (product.stock === 0) {
    return (
      <div>
        <h1 className="title-product">
          {product.name}
        </h1>

        <p className="title-product">
          {product.description}
        </p>

        <p className="out-of-stock">
          Producto agotado
        </p>
      </div>
    );
  }

  return (
    <div>

      <h1 className="title-product">
        {product.name}
      </h1>

      <p className="price-product">
        ${product.price.toLocaleString("es-CO")}
      </p>

      <p className="title-product">
        {product.description}
      </p>

      <p className="stock-available">
        Stock disponible: {product.stock} unidades
      </p>

      <p className="quantity-label">Cantidad: </p>

      <div className="d-flex align-items-center gap-2 mt-4">
        <QuantitySelector
          stock={product.stock}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      </div>

      <br />
      <div className="d-flex gap-2 flex-wrap">
        <button
          type="button"
          className="btn btn-primary btn-add-cart bi bi-cart-fill mt-3"
          onClick={handleAddToCart}
        >
          AÑADIR AL CARRITO
        </button>

        <button
          type="button"
          className="btn btn-outline-primary btn-add-cart bi bi-bookmark-check mt-3"
          onClick={() => requireLogin() && setShowReservation(true)}
        >
          RESERVAR
        </button>
      </div>

      {showSuccess && (
        <div className="cart-success-message" role="status">
          ✅ Producto agregado al carrito
        </div>
      )}

      <ReservationModal
        product={product}
        show={showReservation}
        onClose={() => setShowReservation(false)}
      />

    </div>
  );
}
