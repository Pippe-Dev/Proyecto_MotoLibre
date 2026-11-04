import { useState } from "react";
import type { FormEvent } from "react";

import type { ReservationRecord } from "../../types/reservationRecord";
import { getReservationStatusLabel } from "../../constants/reservationStatus";
import {
  cancelReservation,
  updateReservation,
} from "../../service/reservationService";

const FALLBACK_IMAGE = "/images/sin-imagen.svg";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const formatPrice = (price: number): string =>
  price.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });

function getStatusClass(estado: string): string {
  if (estado === "exitoso") return "reservation-status--entregado";
  if (estado === "eliminado") return "reservation-status--cancelado";
  return "reservation-status--pagado";
}

function getStatusIcon(estado: string): string {
  if (estado === "exitoso") return "bi-bag-check-fill";
  if (estado === "eliminado") return "bi-x-circle-fill";
  return "bi-clock-history";
}

interface ReservationCardProps {
  reservation: ReservationRecord;
  onChange: (updated: ReservationRecord) => void;
}

type Mode = "view" | "edit" | "confirm-cancel";

export function ReservationCard({ reservation, onChange }: ReservationCardProps) {
  const [mode, setMode] = useState<Mode>("view");
  const [cantidad, setCantidad] = useState(String(reservation.cantidad));
  const [celular, setCelular] = useState(reservation.celular);
  const [correo, setCorreo] = useState(reservation.correo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const product = reservation.productos;
  const isActive = reservation.estado === "activo";
  const maxStock = product?.existencias;

  const openEdit = (): void => {
    setCantidad(String(reservation.cantidad));
    setCelular(reservation.celular);
    setCorreo(reservation.correo);
    setError("");
    setMode("edit");
  };

  const closeMode = (): void => {
    setError("");
    setMode("view");
  };

  const handleSave = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    const parsedCantidad = Number(cantidad);
    if (!Number.isInteger(parsedCantidad) || parsedCantidad <= 0) {
      setError("La cantidad debe ser un número entero mayor que 0.");
      return;
    }
    if (celular.trim() === "") {
      setError("El celular no puede estar vacío.");
      return;
    }
    if (!EMAIL_REGEX.test(correo.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const updated = await updateReservation(
        reservation.id_reserva,
        reservation.documento,
        {
          cantidad: parsedCantidad,
          celular: celular.trim(),
          correo: correo.trim(),
        }
      );
      onChange({ ...reservation, ...updated });
      setMode("view");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo actualizar la reserva."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async (): Promise<void> => {
    setBusy(true);
    setError("");

    try {
      const updated = await cancelReservation(
        reservation.id_reserva,
        reservation.documento
      );
      onChange({ ...reservation, ...updated });
      setMode("view");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "No se pudo cancelar la reserva."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <li
      className={`reservation-card${
        reservation.estado === "eliminado" ? " reservation-card--muted" : ""
      }`}
    >
      <div className="reservation-card__media">
        <img
          src={product?.imagen || FALLBACK_IMAGE}
          alt={product?.nombre ?? "Producto no disponible"}
          referrerPolicy="no-referrer"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>

      <div className="reservation-card__body">
        <div className="reservation-card__header">
          <div>
            <span className="reservation-card__code">
              Reserva #{reservation.id_reserva}
            </span>
            <h2 className="reservation-card__name">
              {product?.nombre ?? "Producto no disponible"}
            </h2>
          </div>

          <span className={`reservation-status ${getStatusClass(reservation.estado)}`}>
            <i className={`bi ${getStatusIcon(reservation.estado)}`} aria-hidden="true" />
            {getReservationStatusLabel(reservation.estado)}
          </span>
        </div>

        {mode === "edit" ? (
          <form className="reservation-edit" onSubmit={handleSave} noValidate>
            <div className="reservation-edit__field">
              <label htmlFor={`cantidad-${reservation.id_reserva}`}>Cantidad</label>
              <input
                id={`cantidad-${reservation.id_reserva}`}
                className="form-control"
                type="number"
                min={1}
                max={maxStock}
                value={cantidad}
                onChange={(event) => setCantidad(event.target.value)}
              />
              {maxStock !== undefined && (
                <small>Disponibles: {maxStock}</small>
              )}
            </div>
            <div className="reservation-edit__field">
              <label htmlFor={`celular-${reservation.id_reserva}`}>Celular</label>
              <input
                id={`celular-${reservation.id_reserva}`}
                className="form-control"
                value={celular}
                onChange={(event) => setCelular(event.target.value)}
              />
            </div>
            <div className="reservation-edit__field reservation-edit__field--wide">
              <label htmlFor={`correo-${reservation.id_reserva}`}>Correo</label>
              <input
                id={`correo-${reservation.id_reserva}`}
                className="form-control"
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
              />
            </div>

            {error && (
              <p className="reservation-card__error" role="alert">
                {error}
              </p>
            )}

            <div className="reservation-card__actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={busy}>
                {busy ? "Guardando..." : "Guardar cambios"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={closeMode}
                disabled={busy}
              >
                Descartar
              </button>
            </div>
          </form>
        ) : (
          <>
            <dl className="reservation-card__grid">
              <div>
                <dt>Cantidad</dt>
                <dd>{reservation.cantidad}</dd>
              </div>
              {product && (
                <div>
                  <dt>Precio unitario</dt>
                  <dd>{formatPrice(product.precio)}</dd>
                </div>
              )}
              {product && (
                <div>
                  <dt>Total</dt>
                  <dd className="reservation-card__total">
                    {formatPrice(product.precio * reservation.cantidad)}
                  </dd>
                </div>
              )}
              <div>
                <dt>Reservado a nombre de</dt>
                <dd>{reservation.nombre}</dd>
              </div>
              <div>
                <dt>Celular</dt>
                <dd>{reservation.celular}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd className="reservation-card__email">{reservation.correo}</dd>
              </div>
            </dl>

            {error && (
              <p className="reservation-card__error" role="alert">
                {error}
              </p>
            )}

            {isActive && mode === "view" && (
              <div className="reservation-card__actions">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={openEdit}
                >
                  <i className="bi bi-pencil-square" aria-hidden="true" /> Editar
                </button>
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => {
                    setError("");
                    setMode("confirm-cancel");
                  }}
                >
                  <i className="bi bi-x-lg" aria-hidden="true" /> Cancelar reserva
                </button>
              </div>
            )}

            {mode === "confirm-cancel" && (
              <div className="reservation-card__confirm" role="alertdialog">
                <span>¿Seguro que quieres cancelar esta reserva?</span>
                <div className="reservation-card__actions">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={handleCancel}
                    disabled={busy}
                  >
                    {busy ? "Cancelando..." : "Sí, cancelar"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={closeMode}
                    disabled={busy}
                  >
                    No, volver
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
}
