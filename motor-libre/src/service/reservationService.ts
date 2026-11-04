import type {
  ReservationBatchInput,
  ReservationInput,
  ReservationUpdateInput,
} from "../types/reservation";
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


async function readApiError(response: Response, fallback: string): Promise<Error> {
  try {
    const body = await response.json();
    if (typeof body?.error === "string") {
      return new Error(body.error);
    }
  } catch {
    // La respuesta no era JSON: se usa el mensaje por defecto.
  }
  return new Error(fallback);
}

export async function updateReservation(
  id: number,
  documento: string,
  changes: ReservationUpdateInput
): Promise<ReservationRecord> {
  const response = await fetch(`${API_URL}/reservas/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ documento, ...changes }),
  });

  if (!response.ok) {
    throw await readApiError(response, "No se pudo actualizar la reserva");
  }

  return response.json();
}

export async function cancelReservation(
  id: number,
  documento: string
): Promise<ReservationRecord> {
  const params = new URLSearchParams({ documento });
  const response = await fetch(`${API_URL}/reservas/${id}?${params.toString()}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw await readApiError(response, "No se pudo cancelar la reserva");
  }

  return response.json();
}

// Reserva varios productos a la vez. La API es "todo o nada": si uno falla,
// no queda ninguna reserva creada y el error trae el motivo.
export async function createReservationsBatch(
  input: ReservationBatchInput
): Promise<ReservationRecord[]> {
  const response = await fetch(`${API_URL}/reservas/lote`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await readApiError(response, "No se pudieron registrar las reservas");
  }

  return response.json();
}
