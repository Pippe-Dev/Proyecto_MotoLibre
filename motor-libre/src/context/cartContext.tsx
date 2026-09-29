import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import type {
  CartContextType
} from "../types/cartContextType";

import type { Product } from "../types/detailedProduct";
import type { CartItem } from "../types/cart";


const CartContext = createContext<
  CartContextType | undefined
>(undefined);


const CART_STORAGE_KEY = "motor-libre-cart";


function getInitialCart(): CartItem[] {
  try {
    const storedCart = localStorage.getItem(
      CART_STORAGE_KEY
    );

    if (!storedCart) {
      return [];
    }

    const parsedCart: unknown = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart as CartItem[];
  } catch {
    return [];
  }
}


export function CartProvider({
  children
}: {
  children: React.ReactNode;
}) {

  const [cartItems, setCartItems] =
    useState<CartItem[]>(getInitialCart);


  /*
   * Guarda automáticamente cualquier cambio
   * realizado en el carrito.
   */
  useEffect(() => {

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(cartItems)
    );

  }, [cartItems]);


  const addToCart = (
    product: Product,
    quantity: number
  ): boolean => {

    /*
     * Validamos primero valores que no dependen
     * del estado actual del carrito.
     */
    if (
      quantity < 1 ||
      product.stock < 1 ||
      quantity > product.stock
    ) {
      return false;
    }


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

      const currentItem = currentItems.find(
        item => item.product.id === product.id
      );


      if (currentItem) {

        const updatedQuantity =
          currentItem.quantity + quantity;


        /*
         * Segunda validación con el estado más
         * reciente de React.
         */
        if (updatedQuantity > product.stock) {
          return currentItems;
        }


        return currentItems.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: updatedQuantity
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


    setCartItems(currentItems => {

      const currentItem = currentItems.find(
        item => item.product.id === productId
      );


      if (!currentItem) {
        return currentItems;
      }


      if (
        quantity < 1 ||
        quantity > currentItem.product.stock
      ) {
        return currentItems;
      }


      return currentItems.map(item =>
        item.product.id === productId
          ? {
              ...item,
              quantity
            }
          : item
      );

    });


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