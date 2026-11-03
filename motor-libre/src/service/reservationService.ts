import type { ReservationInput } from "../types/reservation";
import type { ReservationRecord } from "../types/reservationRecord";

const API_URL =
  import.meta.env.VITE_RESERVATIONS_API_URL ?? "http://localhost:3001/api";

export async function createReservation(
  input: ReservationInput
): Promise<void> {
  const response = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("No se pudo registrar la reserva");
  }
}

export async function getReservationsByDocumento(
  documento: string,
  estado?: string
): Promise<ReservationRecord[]> {
  const params = new URLSearchParams({ documento });

  if (estado) {
    params.set("estado", estado);
  }

  const response = await fetch(`${API_URL}/reservas?${params.toString()}`);

  if (!response.ok) {
    throw new Error("No se pudieron consultar las reservas");
  }

  return response.json();
}

