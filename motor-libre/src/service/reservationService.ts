import type {
  ReservationBatchInput,
  ReservationInput,
  ReservationUpdateInput,
} from "../types/reservation";
import type { ReservationRecord } from "../types/reservationRecord";
import { getAccessToken } from "../lib/supabaseClient";

const API_URL =
  import.meta.env.VITE_RESERVATIONS_API_URL ?? "http://localhost:3001/api";

// Si hay sesión de Supabase, la API recibe el token y asocia/valida las reservas
// con la cuenta. Sin sesión se sigue funcionando como invitado.
async function buildHeaders(withJson: boolean, useSession = true): Promise<HeadersInit> {
  const headers: Record<string, string> = {};

  if (withJson) {
    headers["Content-Type"] = "application/json";
  }

  const token = useSession ? await getAccessToken() : null;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
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

export async function createReservation(
  input: ReservationInput
): Promise<void> {
  const response = await fetch(`${API_URL}/reservas`, {
    method: "POST",
    headers: await buildHeaders(true),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await readApiError(response, "No se pudo registrar la reserva");
  }
}

// Reservas de la cuenta con sesión iniciada.
export async function getMyReservations(estado?: string): Promise<ReservationRecord[]> {
  const params = new URLSearchParams();

  if (estado) {
    params.set("estado", estado);
  }

  const query = params.toString();
  const response = await fetch(`${API_URL}/reservas/mias${query ? `?${query}` : ""}`, {
    headers: await buildHeaders(false),
  });

  if (!response.ok) {
    throw await readApiError(response, "No se pudieron consultar las reservas");
  }

  return response.json();
}

// `documento` null = la reserva pertenece a la cuenta (se identifica con el token);
// con un documento se actúa como invitado.
export async function updateReservation(
  id: number,
  documento: string | null,
  changes: ReservationUpdateInput
): Promise<ReservationRecord> {
  const response = await fetch(`${API_URL}/reservas/${id}`, {
    method: "PATCH",
    headers: await buildHeaders(true, documento === null),
    body: JSON.stringify(documento === null ? changes : { documento, ...changes }),
  });

  if (!response.ok) {
    throw await readApiError(response, "No se pudo actualizar la reserva");
  }

  return response.json();
}

export async function cancelReservation(
  id: number,
  documento: string | null
): Promise<ReservationRecord> {
  const query = documento === null ? "" : `?${new URLSearchParams({ documento }).toString()}`;
  const response = await fetch(`${API_URL}/reservas/${id}${query}`, {
    method: "DELETE",
    headers: await buildHeaders(false, documento === null),
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
    headers: await buildHeaders(true),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw await readApiError(response, "No se pudieron registrar las reservas");
  }

  return response.json();
}
