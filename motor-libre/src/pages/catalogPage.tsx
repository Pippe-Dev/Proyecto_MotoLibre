
import { useEffect, useMemo, useState } from "react";
import type { Product } from "../types/detailedProduct";
import { getProducts } from "../service/productService";
import { ProductCard } from "../components/product/productCard";

type SortOption = "default" | "price-asc" | "price-desc" | "name";

export function CatalogPage() {
  const [search, setSearch] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sort, setSort] = useState<SortOption>("default");
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

  // Búsqueda, disponibilidad y orden se aplican en el cliente sobre lo ya cargado.
  const visibleProducts = useMemo(() => {
    if (!products) return null;

    const term = search.trim().toLowerCase();
    const filtered = products.filter(
      (product) =>
        (!onlyAvailable || product.stock > 0) &&
        (term === "" ||
          `${product.name} ${product.brand} ${product.model}`
            .toLowerCase()
            .includes(term))
    );

    if (sort === "price-asc") return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...filtered].sort((a, b) => b.price - a.price);
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name, "es"));
    return filtered;
  }, [products, search, onlyAvailable, sort]);

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
    setSearch("");
    setOnlyAvailable(false);
    setSort("default");
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

        <div className="catalog-filter">
          <label htmlFor="sort-filter">Ordenar por</label>
          <select
            id="sort-filter"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
          >
            <option value="default">Relevancia</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre (A-Z)</option>
          </select>
        </div>

        <button
          type="button"
          className="catalog-filter__clear"
          onClick={clearFilters}
          disabled={!brand && !model && !search && !onlyAvailable && sort === "default"}
        >
          Limpiar filtros
        </button>
      </section>

      <div className="catalog-toolbar">
        <div className="catalog-search">
          <i className="bi bi-search" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, marca o modelo..."
            aria-label="Buscar productos"
          />
        </div>

        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="only-available"
            checked={onlyAvailable}
            onChange={(event) => setOnlyAvailable(event.target.checked)}
          />
          <label className="form-check-label" htmlFor="only-available">
            Solo disponibles
          </label>
        </div>

        {visibleProducts && (
          <span className="catalog-toolbar__count" role="status">
            {visibleProducts.length}{" "}
            {visibleProducts.length === 1 ? "producto" : "productos"}
          </span>
        )}
      </div>

      <div className="product-grid" aria-busy={!products}>
        {!products &&
          [0, 1, 2, 3].map((n) => (
            <div key={n} className="skeleton skeleton--card" />
          ))}

        {visibleProducts?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

        {visibleProducts?.length === 0 && (
          <p>No se encontraron productos con los filtros seleccionados.</p>
        )}
      </div>
    </main>
  );
}
