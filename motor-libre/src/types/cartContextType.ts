import type { CartItem } from "./cart";
import type { Product } from "./detailedProduct";

export interface CartContextType {
  cartItems: CartItem[];

  addToCart: (
    product: Product,
    quantity: number
  ) => boolean;

  removeFromCart: (
    productId: number
  ) => void;

  updateQuantity: (
    productId: number,
    quantity: number
  ) => boolean;

  clearCart: () => void;
}