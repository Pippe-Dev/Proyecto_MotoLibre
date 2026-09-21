import { useState } from "react";

import type { Product } from "../../types/detailedProduct";

import { QuantitySelector } from "./quantitySelector";
import { useCart } from "../../context/cartContext";

import "./styles/productDetailStyles.css";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({product,}: ProductInfoProps) {

  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = () => {
  const added = addToCart(product, quantity);

  if (added) {
    setShowSuccess(true);

    setTimeout(() => {
      setShowSuccess(false);
    }, 2500);
  }

  console.log("Producto:", product);
  console.log("Cantidad:", quantity);
  console.log("¿Se agregó?", added);
};

  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

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

      <h1 className="price-product">
        ${product.price.toLocaleString("es-CO")}
      </h1>

      <p className="title-product">
        {product.description}
      </p>

      <p style={{ fontWeight: "bold" , color: "green"}}>
        Stock disponible: {product.stock} unidades
      </p>

      <p style={{ fontWeight: "bold" , color: "black"}}>Cantidad: </p>

      <div className="d-flex align-items-center gap-2 mt-4">
        <QuantitySelector
          stock={product.stock}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />
      </div>

      <br />
      <button
        className="btn btn-primary btn-add-cart bi bi-cart-fill mt-3"
        onClick={handleAddToCart}
      >
        AÑADIR AL CARRITO
      </button>

      {showSuccess && (
        <div className="cart-success-message">
          ✅ Producto agregado al carrito
        </div>
      )}

    </div>
  );
}