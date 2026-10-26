import type { Product } from "./detailedProduct";

/** Lo único que se persiste del carrito. */
export interface StoredCartItem {
  productId: number;
  quantity: number;
}

/** Línea del carrito con el producto ya resuelto desde el servicio. */
export interface CartItem {
  product: Product;
  quantity: number;
}
