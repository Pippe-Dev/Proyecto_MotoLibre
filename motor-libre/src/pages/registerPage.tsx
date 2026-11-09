import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard, PasswordField } from "../components/auth/authCard";
import { useAuth } from "../context/authContext";
import { useToast } from "../context/toastContext";

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterPage() {
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (nombre.trim() === "") {
      setError("Ingresa tu nombre.");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      const { needsConfirmation } = await signUp(email.trim(), password, {
        nombre: nombre.trim(),
        celular: celular.trim(),
      });

      if (needsConfirmation) {
        setConfirmationSent(true);
      } else {
        showToast("Cuenta creada. ¡Bienvenido a Motor Libre!", "success");
        navigate("/", { replace: true });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo crear la cuenta.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmationSent) {
    return (
      <AuthCard
        title="Revisa tu correo"
        subtitle={`Enviamos un enlace de confirmación a ${email.trim()}. Ábrelo para activar tu cuenta.`}
        footer={<Link to="/login">Ir a iniciar sesión</Link>}
      >
        <p className="auth-alert auth-alert--success" role="status">
          Si no lo ves, revisa la carpeta de spam.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Crear cuenta"
      subtitle="Guarda tus datos y gestiona tus reservas desde un solo lugar."
      footer={
        <>
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label htmlFor="register-nombre">Nombre completo</label>
          <div className="auth-field__control">
            <i className="bi bi-person" aria-hidden="true" />
            <input
              id="register-nombre"
              className="form-control"
              autoComplete="name"
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-email">Correo electrónico</label>
          <div className="auth-field__control">
            <i className="bi bi-envelope" aria-hidden="true" />
            <input
              id="register-email"
              className="form-control"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor="register-celular">Celular (opcional)</label>
          <div className="auth-field__control">
            <i className="bi bi-phone" aria-hidden="true" />
            <input
              id="register-celular"
              className="form-control"
              type="tel"
              autoComplete="tel"
              value={celular}
              onChange={(event) => setCelular(event.target.value)}
            />
          </div>
        </div>

        <PasswordField
          id="register-password"
          label="Contraseña"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
        />

        <PasswordField
          id="register-confirm"
          label="Confirmar contraseña"
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        {error && (
          <p className="auth-alert auth-alert--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary auth-form__submit" disabled={submitting}>
          {submitting ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </AuthCard>
  );
}
