import { useState } from "react";

import type { Product } from "../../types/detailedProduct";
import { createReservation } from "../../service/reservationService";

interface ReservationModalProps {
  product: Product;
  show: boolean;
  onClose: () => void;
}

const DOCUMENT_TYPES = [
  { value: "CC", label: "Cédula de ciudadanía" },
  { value: "CE", label: "Cédula de extranjería" },
  { value: "TI", label: "Tarjeta de identidad" },
  { value: "PA", label: "Pasaporte" },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  nombre: string;
  documento: string;
  tipoDocumento: string;
  correo: string;
  celular: string;
  cantidad: number;
}

function getInitialState(): FormState {
  return {
    nombre: "",
    documento: "",
    tipoDocumento: DOCUMENT_TYPES[0].value,
    correo: "",
    celular: "",
    cantidad: 1,
  };
}

export function ReservationModal({ product, show, onClose }: ReservationModalProps) {
  const [form, setForm] = useState<FormState>(getInitialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!show) {
    return null;
  }

  const handleClose = () => {
    setForm(getInitialState());
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (
      form.nombre.trim() === "" ||
      form.documento.trim() === "" ||
      form.correo.trim() === "" ||
      form.celular.trim() === ""
    ) {
      setError("Completa todos los campos obligatorios.");
      return;
    }

    if (!EMAIL_REGEX.test(form.correo.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    if (form.cantidad < 1 || form.cantidad > product.stock) {
      setError(`La cantidad debe estar entre 1 y ${product.stock}.`);
      return;
    }

    setSubmitting(true);

    try {
      await createReservation({
        nombre: form.nombre.trim(),
        documento: form.documento.trim(),
        tipoDocumento: form.tipoDocumento,
        correo: form.correo.trim(),
        celular: form.celular.trim(),
        idProducto: product.id,
        cantidad: form.cantidad,
      });

      setSuccess(true);
    } catch {
      setError("No se pudo registrar la reserva. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop show" />

      <div
        className="modal d-block reservation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reservation-modal-title"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title" id="reservation-modal-title">
                Reservar {product.name}
              </h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={handleClose}
              />
            </div>

            <div className="modal-body">
              {success ? (
                <p className="cart-success-message" role="status">
                  ✅ Reserva registrada. Pasa a confirmarla y pagarla en tienda.
                </p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label" htmlFor="reservation-nombre">
                      Nombre completo
                    </label>
                    <input
                      id="reservation-nombre"
                      className="form-control"
                      value={form.nombre}
                      onChange={(event) =>
                        setForm({ ...form, nombre: event.target.value })
                      }
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-5 mb-3">
                      <label className="form-label" htmlFor="reservation-tipo-documento">
                        Tipo de documento
                      </label>
                      <select
                        id="reservation-tipo-documento"
                        className="form-select"
                        value={form.tipoDocumento}
                        onChange={(event) =>
                          setForm({ ...form, tipoDocumento: event.target.value })
                        }
                      >
                        {DOCUMENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-7 mb-3">
                      <label className="form-label" htmlFor="reservation-documento">
                        Número de documento
                      </label>
                      <input
                        id="reservation-documento"
                        className="form-control"
                        value={form.documento}
                        onChange={(event) =>
                          setForm({ ...form, documento: event.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="reservation-correo">
                      Correo electrónico
                    </label>
                    <input
                      id="reservation-correo"
                      type="email"
                      className="form-control"
                      value={form.correo}
                      onChange={(event) =>
                        setForm({ ...form, correo: event.target.value })
                      }
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-7 mb-3">
                      <label className="form-label" htmlFor="reservation-celular">
                        Celular
                      </label>
                      <input
                        id="reservation-celular"
                        className="form-control"
                        value={form.celular}
                        onChange={(event) =>
                          setForm({ ...form, celular: event.target.value })
                        }
                      />
                    </div>

                    <div className="col-md-5 mb-3">
                      <label className="form-label" htmlFor="reservation-cantidad">
                        Cantidad
                      </label>
                      <input
                        id="reservation-cantidad"
                        type="number"
                        min={1}
                        max={product.stock}
                        className="form-control"
                        value={form.cantidad}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            cantidad: Number(event.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  {error && (
                    <p className="reservation-error" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary btn-add-cart"
                    disabled={submitting}
                  >
                    {submitting ? "Enviando..." : "CONFIRMAR RESERVA"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
