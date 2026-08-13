import { useState } from "react";
import type { Product } from "../../types/detailedProduct";

interface ProductImageProps {
  product: Product;
}

export function ProductImage({
  product,
}:  ProductImageProps) {

  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });

    const [showZoom, setShowZoom] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {

    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;

    setPosition({ x, y });
  };

  return (
    <div
      className="product-image-container"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)} 
    >
      <img
        src={product.image}
        alt={product.name}
        className="img-fluid product-image"
      />

      {showZoom && (
        <div
          className="image-zoom"
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            backgroundImage: `url(${product.image})`,
            backgroundPosition: `${position.x}% ${position.y}%`
          }}
        />
      )}

    </div>
  );
}