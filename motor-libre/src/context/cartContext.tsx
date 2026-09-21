import {
  createContext,
  useContext,
  useState
} from "react";

import type {
  CartContextType
} from "../types/cartContextType";

import type { Product } from "../types/detailedProduct";
import type { CartItem } from "../types/cart";



const CartContext = createContext<
  CartContextType | undefined
>(undefined);


export function CartProvider({
  children
}: {
  children: React.ReactNode
}) {

  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);


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
                quantity:
                  item.quantity + quantity
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


  const removeFromCart = (
    productId: number
  ): void => {

    setCartItems(currentItems =>
      currentItems.filter(
        item => item.product.id !== productId
      )
    );

  };


  const updateQuantity = (
    productId: number,
    quantity: number
  ): boolean => {

    const item = cartItems.find(
      item => item.product.id === productId
    );


    if (!item) {
      return false;
    }


    if (quantity < 1) {
      return false;
    }


    if (quantity > item.product.stock) {
      return false;
    }


    setCartItems(currentItems =>
      currentItems.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity
            }
          : item
      )
    );


    return true;
  };


  const clearCart = (): void => {

    setCartItems([]);

  };


  return (

    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >

      {children}

    </CartContext.Provider>

  );
}


export function useCart() {

  const context = useContext(CartContext);


  if (!context) {

    throw new Error(
      "useCart debe utilizarse dentro de CartProvider"
    );

  }


  return context;
}