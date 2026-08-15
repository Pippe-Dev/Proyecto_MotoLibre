import { useState } from "react";

import type { Product } from "../../types/detailedProduct";

import { QuantitySelector } from "./quantitySelector";
import { useCart } from "../../context/cartContext";

import "./styles/productDetailStyles.css";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({product,}: ProductInfoProps) {

  const handleAddToCart = () => {

  const added = addToCart(product, quantity);

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

      <h2 className="price-product">
        ${product.price.toLocaleString("es-CO")}
      </h2>

      <p className="title-product">
        {product.description}
      </p>

      <div className="d-flex align-items-center gap-2 mt-4">
        <QuantitySelector
          stock={product.stock}
          quantity={quantity}
          onQuantityChange={setQuantity}
        />

        <button className="btn btn-primary btn-add-cart"
        onClick={handleAddToCart}
        >
          AÑADIR AL CARRITO
        </button>
      </div>


    </div>
  );
}