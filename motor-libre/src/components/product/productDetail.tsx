import type { Product } from "../../types/detailedProduct";

import { useEffect, useState } from "react";
import {useParams} from "react-router-dom";

import { getProductById } from "../../service/productService";

import { ProductImage } from "./productImage";
import { ProductInfo } from "./productInfo";

export function ProductDetail() {

  const { id } = useParams();

   const [product, setProduct] = useState<Product | null>(null);

   useEffect(() => {

    if (!id) {
      return;
    }

    getProductById(Number(id))
      .then((data) => {
        setProduct(data);
      })
      .catch((error) => {
        console.error(error);
      });

  }, [id]);

  if (!product) {
    return <p>Cargando producto...</p>;
  }

  return (
    <div className="container">
      <div className="row">

        <div className="col-md-6">
          <ProductImage 
          product={product}
          />
        </div>

        <div className="col-md-6">
          <ProductInfo 
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