import { useState } from "react";
import type { FormEvent } from "react";

import type { ReservationRecord } from "../../types/reservationRecord";
import { RESERVATION_STATUS_OPTIONS } from "../../constants/reservationStatus";
import { getReservationsByDocumento } from "../../service/reservationService";
import { ReservationCard } from "./reservationCard";

import "./reservationsLookup.css";

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

  const handleReservationChange = (updated: ReservationRecord): void => {
    setResults((current) =>
      current
        ? current.map((item) =>
            item.id_reserva === updated.id_reserva ? updated : item
          )
        : current
    );
  };

  const handleClear = (): void => {
    setDocumento("");
    setEstado("");
    setResults(null);
    setError(false);
    setSearched(false);
  };

  const activeCount =
    results?.filter((item) => item.estado === "activo").length ?? 0;

  return (
    <main className="container py-4 reservation-page">
      <header className="reservation-page__header">
        <h1 className="page-title">Mis reservas</h1>
        <p className="reservation-page__subtitle">
          Consulta, edita o cancela tus reservas con tu número de documento.
        </p>
      </header>

      <form className="reservation-lookup__form" onSubmit={handleSubmit}>
        <div className="reservation-lookup__field reservation-lookup__field--grow">
          <label className="form-label" htmlFor="lookup-documento">
            Número de documento
          </label>
          <div className="reservation-lookup__input">
            <i className="bi bi-person-vcard" aria-hidden="true" />
            <input
              id="lookup-documento"
              className="form-control"
              value={documento}
              onChange={(event) => setDocumento(event.target.value)}
              placeholder="Ej: 123456789"
              inputMode="numeric"
            />
          </div>
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

        <div className="reservation-lookup__buttons">
          <button
            type="submit"
            className="btn btn-primary reservation-lookup__submit"
            disabled={documento.trim() === "" || loading}
          >
            <i className="bi bi-search" aria-hidden="true" /> Buscar
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary reservation-lookup__submit"
            onClick={handleClear}
          >
            Limpiar
          </button>
        </div>
      </form>

      {!searched && !loading && (
        <div className="reservation-empty">
          <i className="bi bi-bag-heart" aria-hidden="true" />
          <p>Ingresa tu documento para ver tus reservas.</p>
        </div>
      )}

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
        <div className="reservation-empty" role="status">
          <i className="bi bi-inbox" aria-hidden="true" />
          <p>No se encontraron reservas para ese documento.</p>
        </div>
      )}

      {!loading && !error && results && results.length > 0 && (
        <>
          <p className="reservation-summary" role="status">
            <strong>{results.length}</strong>{" "}
            {results.length === 1 ? "reserva encontrada" : "reservas encontradas"}
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
              />
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
