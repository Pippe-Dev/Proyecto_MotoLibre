import type { CartItem } from "../types/cart";

//const API_URL = "http://localhost:3000/api";

/*
 * Mock del registro del pedido. Se reemplazará por la
 * API de reservas (POST /reservas).
 */
export async function createOrder(items: CartItem[]): Promise<void> {
  if (items.length === 0) {
    throw new Error("El carrito está vacío");
  }
}
