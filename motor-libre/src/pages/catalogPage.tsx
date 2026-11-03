
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/detailedProduct";
import { getProducts } from "../service/productService";

export function CatalogPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getProducts()
      .then((data) => {
        if (!cancelled) {
          setAllProducts(data);
          setProducts(data);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const brands = useMemo(
    () =>
      [...new Set(allProducts.map((product) => product.brand).filter(Boolean))]
        .sort(),
    [allProducts]
  );

  const models = useMemo(
    () =>
      [
        ...new Set(
          allProducts
            .filter((product) => !brand || product.brand === brand)
            .map((product) => product.model)
            .filter(Boolean)
        ),
      ].sort(),
    [allProducts, brand]
  );

  const applyFilters = async (selectedBrand: string, selectedModel: string) => {
    setError(false);
    setProducts(null);

    try {
      const data = await getProducts({
        brand: selectedBrand || undefined,
        model: selectedModel || undefined,
      });
      setProducts(data);
    } catch {
      setError(true);
    }
  };

  const handleBrandChange = (value: string) => {
    setBrand(value);
    setModel("");
    void applyFilters(value, "");
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    void applyFilters(brand, value);
  };

  const clearFilters = () => {
    setBrand("");
    setModel("");
    void applyFilters("", "");
  };

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

      <section className="catalog-filters" aria-label="Filtros de productos">
        <div className="catalog-filter">
          <label htmlFor="brand-filter">Marca</label>
          <select
            id="brand-filter"
            value={brand}
            onChange={(event) => handleBrandChange(event.target.value)}
          >
            <option value="">Todas las marcas</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="catalog-filter">
          <label htmlFor="model-filter">Modelo</label>
          <select
            id="model-filter"
            value={model}
            onChange={(event) => handleModelChange(event.target.value)}
          >
            <option value="">Todos los modelos</option>
            {models.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="catalog-filter__clear"
          onClick={clearFilters}
          disabled={!brand && !model}
        >
          Limpiar filtros
        </button>
      </section>

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
              <img
                src={product.images[0]}
                alt={product.name}
              />
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

        {products?.length === 0 && (
          <p>No se encontraron productos con los filtros seleccionados.</p>
        )}
      </div>
    </main>
  );
}
