import type { Product } from "../../types/detailedProduct";
import { QuantitySelector } from "./quantitySelector";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({
  product,
}: ProductInfoProps) {

    if (product.stock === 0) {
    return (
      <div>
        <h1>{product.name}</h1>

        <h2>${product.price.toFixed(2)}</h2>

        <p>{product.description}</p>

        <p>Producto agotado</p>
      </div>
    );
  }

  return (
    <div>

      <h1>{product.name}</h1>

      <h2>${product.price.toFixed(2)}</h2>

      <p>
        {product.description}
      </p>


      <QuantitySelector />

      <button className="btn btn-primary">
        Añadir al carrito
      </button>

    </div>
  );
}