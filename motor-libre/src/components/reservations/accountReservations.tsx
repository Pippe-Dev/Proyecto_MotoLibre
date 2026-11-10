import { useEffect, useState } from "react";

import type { ReservationRecord } from "../../types/reservationRecord";
import { RESERVATION_STATUS_OPTIONS } from "../../constants/reservationStatus";
import { getMyReservations } from "../../service/reservationService";
import { ReservationCard } from "./reservationCard";

import "./reservationsLookup.css";

// Reservas de la cuenta con sesión iniciada: se cargan solas, sin pedir documento.
export function AccountReservations() {
  const [estado, setEstado] = useState("");
  const [results, setResults] = useState<ReservationRecord[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getMyReservations(estado || undefined)
      .then((data) => {
        if (!cancelled) {
          setResults(data);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [estado, attempt]);

  const handleEstadoChange = (value: string): void => {
    setResults(null);
    setError(false);
    setEstado(value);
  };

  const handleReservationChange = (updated: ReservationRecord): void => {
    setResults((current) =>
      current
        ? current.map((item) =>
            item.id_reserva === updated.id_reserva ? updated : item
          )
        : current
    );
  };

  const activeCount =
    results?.filter((item) => item.estado === "activo").length ?? 0;
  const loading = results === null && !error;

  return (
    <main className="container py-4 reservation-page">
      <header className="reservation-page__header">
        <h1 className="page-title">Mis reservas</h1>
        <p className="reservation-page__subtitle">
          Todas las reservas de tu cuenta, siempre actualizadas.
        </p>
      </header>

      <div className="reservation-lookup__form">
        <div className="reservation-lookup__field">
          <label className="form-label" htmlFor="account-estado">
            Estado
          </label>
          <select
            id="account-estado"
            className="form-select"
            value={estado}
            onChange={(event) => handleEstadoChange(event.target.value)}
          >
            <option value="">Todas</option>
            {RESERVATION_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="reservation-lookup__results" aria-busy="true">
          {[0, 1].map((n) => (
            <div key={n} className="skeleton skeleton--card" />
          ))}
        </div>
      )}

      {error && (
        <div className="state-message" role="alert">
          <p>No se pudieron consultar las reservas.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setAttempt((current) => current + 1)}
          >
            Reintentar
          </button>
        </div>
      )}

      {results?.length === 0 && (
        <div className="reservation-empty" role="status">
          <i className="bi bi-inbox" aria-hidden="true" />
          <p>
            {estado
              ? "No tienes reservas con ese estado."
              : "Aún no has hecho ninguna reserva con tu cuenta."}
          </p>
        </div>
      )}

      {results && results.length > 0 && (
        <>
          <p className="reservation-summary" role="status">
            <strong>{results.length}</strong>{" "}
            {results.length === 1 ? "reserva" : "reservas"}
            {" · "}
            <strong>{activeCount}</strong>{" "}
            {activeCount === 1 ? "activa" : "activas"}
          </p>

          <ul className="reservation-lookup__results" role="list">
            {results.map((reservation) => (
              <ReservationCard
                key={reservation.id_reserva}
                reservation={reservation}
                onChange={handleReservationChange}
                byAccount
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
