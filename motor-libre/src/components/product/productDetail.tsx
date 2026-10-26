import type { Product } from "../../types/detailedProduct";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getProductById } from "../../service/productService";

import { ProductImage } from "./productImage";
import { ProductInfo } from "./productInfo";

export function ProductDetail() {

  const { id } = useParams();

  const [product, setProduct] = useState<Product | null>(null);
  const [failedId, setFailedId] = useState<string | null>(null);

  useEffect(() => {

    if (!id) {
      return;
    }

    let cancelled = false;

    getProductById(Number(id))
      .then((data) => {
        if (!cancelled) {
          setProduct(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailedId(id);
        }
      });

    return () => {
      cancelled = true;
    };

  }, [id]);

  if (!id || failedId === id) {
    return (
      <div className="container state-message">
        <p>Producto no encontrado.</p>
        <Link className="btn btn-primary" to="/catalogo">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  if (!product || String(product.id) !== id) {
    return (
      <div className="container py-4" aria-busy="true">
        <div className="row">
          <div className="col-md-6">
            <div className="skeleton skeleton--image mx-auto" />
          </div>
          <div className="col-md-6">
            <div className="skeleton skeleton--line" />
            <div className="skeleton skeleton--line w-50" />
            <div className="skeleton skeleton--line" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <nav className="breadcrumb-nav" aria-label="Ruta de navegación">
        <Link to="/catalogo">Tienda</Link>
        <span aria-hidden="true">/</span>
        {product.name}
      </nav>

      <div className="row">

        <div className="col-md-6">
          <ProductImage
            key={product.id}
            product={product}
          />
        </div>

        <div className="col-md-6">
          <ProductInfo
            key={product.id}
            product={product}
          />
        </div>

      </div>

      <div className="product-benefits">

        <div className="product-benefit">
          <i className="bi bi-clock benefit-icon"></i>

          <div>
            <strong>Pago en tienda</strong>
            <span>Recoge en tienda</span>
          </div>
        </div>


        <div className="product-benefit">
          <i className="bi bi-patch-check benefit-icon"></i>

          <div>
            <strong>Garantía de calidad</strong>
            <span>Productos certificados</span>
          </div>
        </div>


        <div className="product-benefit">
          <i className="bi bi-chat-left-text benefit-icon"></i>

          <div>
            <strong>¿Tienes dudas?</strong>
            <span>Contáctanos</span>
          </div>
        </div>

      </div>
    </div>
  );
}
