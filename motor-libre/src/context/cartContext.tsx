import { createContext, useContext, useState } from "react";
import type { Product } from "../types/detailedProduct";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (
  product: Product,
  quantity: number
): boolean => {

  const existingItem = cartItems.find(
    item => item.product.id === product.id
  );

  const newQuantity = existingItem
    ? existingItem.quantity + quantity
    : quantity;

  if (newQuantity > product.stock) {
    return false;
  }

  setCartItems(currentItems => {

    if (existingItem) {

      return currentItems.map(item =>
        item.product.id === product.id
          ? {
              ...item,
              quantity: item.quantity + quantity
            }
          : item
      );
    }

    return [
      ...currentItems,
      {
        product,
        quantity
      }
    ];
  });

  return true;
};

  return (
    <CartContext.Provider value={{ cartItems, addToCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {

  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart debe utilizarse dentro de CartProvider");
  }

  return context;
}