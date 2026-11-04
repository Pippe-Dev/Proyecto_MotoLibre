import { useState } from "react";

import type { CartItem } from "../../types/cart";
import { createReservationsBatch } from "../../service/reservationService";

interface CartReservationModalProps {
  cartItems: CartItem[];
  show: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
}

function getInitialState(): FormState {
  return {
    nombre: "",
    documento: "",
    tipoDocumento: DOCUMENT_TYPES[0].value,
    correo: "",
    celular: "",
  };
}

export function CartReservationModal({
  cartItems,
  show,
  onClose,
  onSuccess,
}: CartReservationModalProps) {
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

    setSubmitting(true);

    try {
      await createReservationsBatch({
        nombre: form.nombre.trim(),
        documento: form.documento.trim(),
        tipoDocumento: form.tipoDocumento,
        correo: form.correo.trim(),
        celular: form.celular.trim(),
        items: cartItems.map((item) => ({
          idProducto: item.product.id,
          cantidad: item.quantity,
        })),
      });

      setSuccess(true);
      onSuccess();
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? `${caught.message} No se creó ninguna reserva.`
          : "No se pudieron registrar las reservas. No se creó ninguna reserva. Inténtalo de nuevo."
      );
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
        aria-labelledby="cart-reservation-modal-title"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title" id="cart-reservation-modal-title">
                Reservar productos del carrito
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
                  <ul className="cart-reservation-items">
                    {cartItems.map((item) => (
                      <li key={item.product.id}>
                        {item.product.name} × {item.quantity}
                      </li>
                    ))}
                  </ul>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="cart-reservation-nombre">
                      Nombre completo
                    </label>
                    <input
                      id="cart-reservation-nombre"
                      className="form-control"
                      value={form.nombre}
                      onChange={(event) =>
                        setForm({ ...form, nombre: event.target.value })
                      }
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-5 mb-3">
                      <label
                        className="form-label"
                        htmlFor="cart-reservation-tipo-documento"
                      >
                        Tipo de documento
                      </label>
                      <select
                        id="cart-reservation-tipo-documento"
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
                      <label className="form-label" htmlFor="cart-reservation-documento">
                        Número de documento
                      </label>
                      <input
                        id="cart-reservation-documento"
                        className="form-control"
                        value={form.documento}
                        onChange={(event) =>
                          setForm({ ...form, documento: event.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="cart-reservation-correo">
                      Correo electrónico
                    </label>
                    <input
                      id="cart-reservation-correo"
                      type="email"
                      className="form-control"
                      value={form.correo}
                      onChange={(event) =>
                        setForm({ ...form, correo: event.target.value })
                      }
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label" htmlFor="cart-reservation-celular">
                      Celular
                    </label>
                    <input
                      id="cart-reservation-celular"
                      className="form-control"
                      value={form.celular}
                      onChange={(event) =>
                        setForm({ ...form, celular: event.target.value })
                      }
                    />
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
                    {submitting ? "Enviando..." : "CONFIRMAR RESERVA DEL CARRITO"}
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
