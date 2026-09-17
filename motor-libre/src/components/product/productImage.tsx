import { useState } from "react";
import type { Product } from "../../types/detailedProduct";
import "./styles/productImageStyles.css";

interface ProductImageProps {
  product: Product;
}

export function ProductImage({
  product,
}: ProductImageProps) {

  const [selectedImage, setSelectedImage] = useState(0);

  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  });

  const [showZoom, setShowZoom] = useState(false);

  const currentImage = product.images[selectedImage];

  const handleMouseMove = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {

    const { left, top, width, height } =
      event.currentTarget.getBoundingClientRect();

    const x = ((event.clientX - left) / width) * 100;
    const y = ((event.clientY - top) / height) * 100;

    setPosition({ x, y });
  };

  const nextImage = () => {
    setSelectedImage((prev) =>
      prev === product.images.length - 1
        ? 0
        : prev + 1
    );
  };

  const previousImage = () => {
    setSelectedImage((prev) =>
      prev === 0
        ? product.images.length - 1
        : prev - 1
    );
  };

  return (
    <div className="product-gallery">

      <div
        className="product-image-container"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setShowZoom(true)}
        onMouseLeave={() => setShowZoom(false)}
      >

        {product.images.length > 1 && (
          <>
            <button
              className="gallery-arrow left"
              onClick={previousImage}
            >
              ❮
            </button>

            <button
              className="gallery-arrow right"
              onClick={nextImage}
            >
              ❯
            </button>
          </>
        )}

         <img src={currentImage} alt={product.name} />

        {showZoom && (
          <div
            className="image-zoom"
            style={{
              left: `${position.x}%`,
              top: `${position.y}%`,
              backgroundImage: `url(${currentImage})`,
              backgroundPosition: `${position.x}% ${position.y}%`,
            }}
          />
        )}
      </div>

      {product.images.length > 1 && (
        <div className="thumbnail-container">

          {product.images.map((image, index) => (
            <button
              key={image}
              type="button"
              className={`thumbnail ${
                selectedImage === index
                  ? "active"
                  : ""
              }`}
              onClick={() => setSelectedImage(index)}
            >
              <img className="thumbnail-image" src={image} alt={product.name} />
            </button>
          ))}

        </div>
      )}

    </div>
  );
}