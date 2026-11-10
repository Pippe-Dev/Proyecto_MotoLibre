import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { AuthCard } from "../components/auth/authCard";
import { useAuth } from "../context/authContext";

export function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo enviar el correo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para crear una contraseña nueva."
      footer={<Link to="/login">Volver a iniciar sesión</Link>}
    >
      {sent ? (
        <p className="auth-alert auth-alert--success" role="status">
          Si existe una cuenta con ese correo, recibirás un enlace en unos minutos.
        </p>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="forgot-email">Correo electrónico</label>
            <div className="auth-field__control">
              <i className="bi bi-envelope" aria-hidden="true" />
              <input
                id="forgot-email"
                className="form-control"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <p className="auth-alert auth-alert--error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary auth-form__submit" disabled={submitting}>
            {submitting ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}
