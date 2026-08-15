import type { Product } from "./detailedProduct";

export interface CartItem {
  product: Product;
  quantity: number;
}