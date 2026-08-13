import type { Product } from "../../types/detailedProduct";

interface ProductImageProps {
  product: Product;
}

export function ProductImage({
  product,
}:  ProductImageProps) {

  return (
    <div>
      <img
        src={product.image}
        alt={product.name}
        className="img-fluid"
      />
    </div>
  );
}