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
    </div>
  );
}