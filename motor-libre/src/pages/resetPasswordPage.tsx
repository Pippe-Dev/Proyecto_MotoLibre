import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthCard, PasswordField } from "../components/auth/authCard";
import { useAuth } from "../context/authContext";
import { useToast } from "../context/toastContext";

const MIN_PASSWORD_LENGTH = 8;

// Destino del enlace del correo de recuperación: Supabase abre una sesión
// temporal a partir del enlace y aquí se fija la contraseña nueva.
export function ResetPasswordPage() {
  const { user, loading, updatePassword } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

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
      await updatePassword(password);
      showToast("Contraseña actualizada.", "success");
      navigate("/", { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No se pudo actualizar la contraseña.");
      setSubmitting(false);
    }
  };

  if (!loading && !user) {
    return (
      <AuthCard
        title="Enlace no válido"
        subtitle="El enlace de recuperación expiró o ya fue usado."
        footer={<Link to="/recuperar">Solicitar un enlace nuevo</Link>}
      >
        <></>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Nueva contraseña" subtitle="Elige una contraseña segura para tu cuenta.">
      <form className="auth-form" onSubmit={handleSubmit}>
        <PasswordField
          id="reset-password"
          label="Contraseña nueva"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
        />
        <PasswordField
          id="reset-confirm"
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
          {submitting ? "Guardando..." : "Guardar contraseña"}
        </button>
      </form>
    </AuthCard>
  );
}
