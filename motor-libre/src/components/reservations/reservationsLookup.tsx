import { useState } from "react";
import type { FormEvent } from "react";

import type { ReservationRecord } from "../../types/reservationRecord";
import {
  RESERVATION_STATUS_OPTIONS,
  getReservationStatusLabel,
} from "../../constants/reservationStatus";
import { getReservationsByDocumento } from "../../service/reservationService";

import "./reservationsLookup.css";

const formatPrice = (price: number): string =>
  price.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

function getStatusModifierClass(estado: string): string {
  if (estado === "exitoso") {
    return "reservation-status--entregado";
  }

  if (estado === "eliminado") {
    return "reservation-status--cancelado";
  }

  return "reservation-status--pagado";
}

export function ReservationsLookup() {
  const [documento, setDocumento] = useState("");
  const [estado, setEstado] = useState("");
  const [results, setResults] = useState<ReservationRecord[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    const trimmedDocumento = documento.trim();

    if (trimmedDocumento === "") {
      return;
    }

    setLoading(true);
    setError(false);
    setSearched(true);

    try {
      const data = await getReservationsByDocumento(
        trimmedDocumento,
        estado || undefined
      );
      setResults(data);
    } catch {
      setError(true);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setDocumento("");
    setEstado("");
    setResults(null);
    setError(false);
    setSearched(false);
  };

  return (
    <main className="container py-4">
      <h1 className="page-title">Consultar reservas</h1>

      <form
        className="reservation-lookup__form"
        onSubmit={handleSubmit}
      >
        <div className="reservation-lookup__field">
          <label className="form-label" htmlFor="lookup-documento">
            Número de documento
          </label>
          <input
            id="lookup-documento"
            className="form-control"
            value={documento}
            onChange={(event) => setDocumento(event.target.value)}
            placeholder="Ej: 123456789"
          />
        </div>

        <div className="reservation-lookup__field">
          <label className="form-label" htmlFor="lookup-estado">
            Estado
          </label>
          <select
            id="lookup-estado"
            className="form-select"
            value={estado}
            onChange={(event) => setEstado(event.target.value)}
          >
            <option value="">Todas</option>
            {RESERVATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="btn btn-primary reservation-lookup__submit"
          disabled={documento.trim() === ""}
        >
          Buscar
        </button>

        <button
          type="button"
          className="btn btn-outline-secondary reservation-lookup__submit"
          onClick={handleClear}
        >
          Limpiar
        </button>
      </form>

      {loading && (
        <div className="reservation-lookup__results" aria-busy="true">
          {[0, 1].map((n) => (
            <div key={n} className="skeleton skeleton--card" />
          ))}
        </div>
      )}

      {!loading && error && (
        <p className="state-message" role="alert">
          No se pudieron consultar las reservas. Inténtalo de nuevo.
        </p>
      )}

      {!loading && !error && searched && results?.length === 0 && (
        <p className="state-message" role="status">
          No se encontraron reservas para ese documento.
        </p>
      )}

      {!loading && !error && results && results.length > 0 && (
        <ul className="reservation-lookup__results" role="list">
          {results.map((reservation) => (
            <li className="reservation-card" key={reservation.id_reserva}>
              <div className="reservation-card__info">
                <h2 className="reservation-card__name">
                  {reservation.productos?.nombre ?? "Producto no disponible"}
                </h2>
                <span className="reservation-card__detail">
                  Cantidad: {reservation.cantidad}
                </span>
                {reservation.productos && (
                  <span className="reservation-card__detail">
                    Subtotal:{" "}
                    {formatPrice(
                      reservation.productos.precio * reservation.cantidad
                    )}
                  </span>
                )}
              </div>

              <span
                className={`reservation-status ${getStatusModifierClass(
                  reservation.estado
                )}`}
              >
                {getReservationStatusLabel(reservation.estado)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
