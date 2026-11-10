import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { AuthCard, PasswordField } from "../components/auth/authCard";
import { useAuth } from "../context/authContext";
import { useToast } from "../context/toastContext";

export function LoginPage() {
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn(email.trim(), password);
      showToast("Sesión iniciada. ¡Bienvenido de nuevo!", "success");
      navigate(from, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo iniciar sesión.");
      setSubmitting(false);
    }
  };

  return (
    <AuthCard
      title="Iniciar sesión"
      subtitle="Accede para gestionar tus reservas y favoritos."
      footer={
        <>
          ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="login-email">Correo electrónico</label>
          <div className="auth-field__control">
            <i className="bi bi-envelope" aria-hidden="true" />
            <input
              id="login-email"
              className="form-control"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
        </div>

        <PasswordField
          id="login-password"
          label="Contraseña"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />

        <Link className="auth-form__link" to="/recuperar">
          ¿Olvidaste tu contraseña?
        </Link>

        {error && (
          <p className="auth-alert auth-alert--error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="btn btn-primary auth-form__submit" disabled={submitting}>
          {submitting ? "Ingresando..." : "Iniciar sesión"}
        </button>
      </form>
    </AuthCard>
  );
}
