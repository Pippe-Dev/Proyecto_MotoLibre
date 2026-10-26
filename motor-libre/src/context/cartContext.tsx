import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";

import type { CartContextType } from "../types/cartContextType";
import type { Product } from "../types/detailedProduct";
import type { CartItem, StoredCartItem } from "../types/cart";
import { getProductById } from "../service/productService";


const CartContext = createContext<
  CartContextType | undefined
>(undefined);


const CART_STORAGE_KEY = "motor-libre-cart";


function toStoredItem(raw: unknown): StoredCartItem | null {
  if (typeof raw !== "object" || raw === null) {
    return null;
  }

  const entry = raw as Record<string, unknown>;

  /*
   * Formato anterior: { product, quantity }.
   */
  const legacyId = (entry.product as { id?: unknown } | undefined)?.id;
  const productId = entry.productId ?? legacyId;

  if (
    typeof productId !== "number" ||
    typeof entry.quantity !== "number" ||
    entry.quantity < 1
  ) {
    return null;
  }

  return { productId, quantity: entry.quantity };
}


function getInitialCart(): StoredCartItem[] {
  try {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return [];
    }

    const parsedCart: unknown = JSON.parse(storedCart);

    if (!Array.isArray(parsedCart)) {
      return [];
    }

    return parsedCart
      .map(toStoredItem)
      .filter((item): item is StoredCartItem => item !== null);
  } catch {
    return [];
  }
}


export function CartProvider({
  children
}: {
  children: React.ReactNode;
}) {

  /*
   * En localStorage solo se guardan id y cantidad; el precio
   * y el stock siempre se consultan al servicio.
   */
  const [lines, setLines] =
    useState<StoredCartItem[]>(getInitialCart);

  const [products, setProducts] =
    useState<Record<number, Product>>({});


  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(lines)
      );
    } catch {
      // Almacenamiento no disponible: el carrito sigue en memoria.
    }
  }, [lines]);


  /*
   * Al iniciar, se resuelven los productos guardados. Si alguno
   * ya no existe se retira del carrito.
   */
  useEffect(() => {
    let cancelled = false;

    getInitialCart().forEach(({ productId }) => {
      getProductById(productId)
        .then(product => {
          if (!cancelled) {
            setProducts(current => ({
              ...current,
              [productId]: product
            }));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setLines(current =>
              current.filter(line => line.productId !== productId)
            );
          }
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);


  const cartItems = useMemo<CartItem[]>(
    () =>
      lines.flatMap(({ productId, quantity }) =>
        products[productId]
          ? [{ product: products[productId], quantity }]
          : []
      ),
    [lines, products]
  );


  const addToCart = (
    product: Product,
    quantity: number
  ): boolean => {

    const existing = lines.find(
      line => line.productId === product.id
    );

    const newQuantity = (existing?.quantity ?? 0) + quantity;

    if (
      quantity < 1 ||
      product.stock < 1 ||
      newQuantity > product.stock
    ) {
      return false;
    }

    setProducts(current => ({ ...current, [product.id]: product }));

    setLines(current =>
      existing
        ? current.map(line =>
            line.productId === product.id
              ? { ...line, quantity: newQuantity }
              : line
          )
        : [...current, { productId: product.id, quantity }]
    );

    return true;
  };


  const removeFromCart = (productId: number): void => {
    setLines(current =>
      current.filter(line => line.productId !== productId)
    );
  };


  const updateQuantity = (
    productId: number,
    quantity: number
  ): boolean => {

    const product = products[productId];

    if (
      !product ||
      !lines.some(line => line.productId === productId) ||
      quantity < 1 ||
      quantity > product.stock
    ) {
      return false;
    }

    setLines(current =>
      current.map(line =>
        line.productId === productId
          ? { ...line, quantity }
          : line
      )
    );

    return true;
  };


  const clearCart = (): void => {
    setLines([]);
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


// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {

  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe utilizarse dentro de CartProvider"
    );
  }

  return context;
}
