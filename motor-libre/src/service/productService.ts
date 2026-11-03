
import type { Product } from "../types/detailedProduct";

const API_URL = "http://localhost:3000/api";

interface ApiProduct {
  id_producto: number;
  nombre: string;
  descripcion: string;
  imagen: string | null;
  precio: number | string;
  existencias: number | string;
  marca?: string | null;
  modelo?: string | null;
}

function mapProduct(product: ApiProduct): Product {
  return {
    id: Number(product.id_producto),
    name: product.nombre,
    price: Number(product.precio),
    description: product.descripcion,
    images: product.imagen ? [product.imagen] : [],
    stock: Number(product.existencias),
    brand: product.marca ?? "",
    model: product.modelo ?? "",
  };
}

export async function getProducts(
  filters?: { brand?: string; model?: string }
): Promise<Product[]> {
  const params = new URLSearchParams();

  if (filters?.brand) {
    params.set("marca", filters.brand);
  }

  if (filters?.model) {
    params.set("modelo", filters.model);
  }

  const query = params.toString();
  const url = query
    ? `${API_URL}/products?${query}`
    : `${API_URL}/products`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("No se pudieron obtener los productos");
  }

  const products: ApiProduct[] = await response.json();

  return products.map(mapProduct);
}

export async function getProductById(id: number): Promise<Product> {
  const response = await fetch(`${API_URL}/products/${id}`);

  if (!response.ok) {
    throw new Error("Producto no encontrado");
  }

  const product: ApiProduct = await response.json();

  return mapProduct(product);
}
