import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { ProductCard } from "../components/product/productCard";
import { useFavorites } from "../context/favoritesContext";
import { getProducts } from "../service/productService";
import type { Product } from "../types/detailedProduct";

export function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((data) => {
        if (!cancelled) setProducts(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const favorites = products?.filter((product) => favoriteIds.includes(product.id));

  return (
    <main className="container py-4">
      <h1 className="page-title">Mis favoritos</h1>

      {error && (
        <p className="state-message" role="alert">
          No se pudieron cargar los productos.
        </p>
      )}

      {!error && !products && (
        <div className="product-grid" aria-busy="true">
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="skeleton skeleton--card" />
          ))}
        </div>
      )}

      {favorites && favorites.length === 0 && (
        <div className="reservation-empty">
          <i className="bi bi-heart" aria-hidden="true" />
          <p>Todavía no has marcado ningún producto como favorito.</p>
          <Link to="/catalogo" className="btn btn-primary">
            Explorar la tienda
          </Link>
        </div>
      )}

      {favorites && favorites.length > 0 && (
        <div className="product-grid">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
