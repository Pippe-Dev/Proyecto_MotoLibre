import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/detailedProduct";
import { getProducts } from "../service/productService";

export function CatalogPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setError(false);
    setAttempt((current) => current + 1);
  };

  if (error) {
    return (
      <main className="container state-message">
        <p>No se pudieron cargar los productos.</p>
        <button type="button" className="btn btn-primary" onClick={retry}>
          Reintentar
        </button>
      </main>
    );
  }

  return (
    <main className="container py-4">
      <h1 className="page-title">Tienda</h1>

      <div className="product-grid" aria-busy={!products}>
        {!products &&
          [0, 1, 2, 3].map((n) => (
            <div key={n} className="skeleton skeleton--card" />
          ))}

        {products?.map((product) => (
          <Link
            key={product.id}
            to={`/producto/${product.id}`}
            className={
              product.stock === 0
                ? "product-card product-card--soldout"
                : "product-card"
            }
          >
            <div className="product-card__image">
              <img src={product.images[0]} alt={product.name} />
            </div>

            <div className="product-card__body">
              <h2 className="product-card__name">{product.name}</h2>
              <p className="product-card__price">
                ${product.price.toLocaleString("es-CO")}
              </p>
              {product.stock === 0 && (
                <span className="product-card__tag">Agotado</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
